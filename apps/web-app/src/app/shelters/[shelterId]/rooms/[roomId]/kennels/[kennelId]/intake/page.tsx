import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { db } from "@acme/db/client";

import { AnimalForm } from "./_components/animal-form";
import { IntakeFormUpload } from "./_components/intake-form-upload";

export const metadata: Metadata = {
  description: "Add a new animal to the kennel",
  title: "Animal Intake",
};

interface Props {
  params: {
    kennelId: string;
    roomId: string;
    shelterId: string;
  };
}

export default async function IntakePage({ params }: Props) {
  const kennel = await db.query.Kennels.findFirst({
    where: (kennel, { eq }) => eq(kennel.id, params.kennelId),
  });

  if (!kennel) {
    redirect(`/shelters/${params.shelterId}/rooms/${params.roomId}/kennels`);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Animal Intake</h1>
          <p className="text-muted-foreground">
            Add a new animal to kennel {kennel.name}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <IntakeFormUpload kennelId={params.kennelId} />
          <AnimalForm
            kennelId={params.kennelId}
            roomId={params.roomId}
            shelterId={params.shelterId}
          />
        </div>
      </div>
    </div>
  );
}
