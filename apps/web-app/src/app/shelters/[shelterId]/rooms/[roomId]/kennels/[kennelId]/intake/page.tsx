import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { db } from "@acme/db/client";

import { AnimalForm } from "./_components/animal-form";

export const metadata: Metadata = {
  description: "Add a new animal to the kennel",
  title: "Animal Intake",
};

interface Props {
  params: Promise<{
    kennelId: string;
    roomId: string;
    shelterId: string;
  }>;
}

export default async function IntakePage({ params }: Props) {
  const { kennelId, roomId, shelterId } = await params;

  const kennel = await db.query.Kennels.findFirst({
    where: (kennel, { eq }) => eq(kennel.id, kennelId),
  });

  if (!kennel) {
    redirect(`/shelters/${shelterId}/rooms/${roomId}/kennels`);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Animal Intake to kennel {kennel.name}
          </h1>
        </div>

        <div className="flex flex-col gap-8">
          <AnimalForm
            kennelId={kennelId}
            roomId={roomId}
            shelterId={shelterId}
          />
        </div>
      </div>
    </div>
  );
}
