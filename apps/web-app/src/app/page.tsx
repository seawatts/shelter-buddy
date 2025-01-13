import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@acme/ui/button";
import { H1 } from "@acme/ui/typography";

import { env } from "~/env.server";
import { getCurrentShelter } from "~/lib/shelter";

export default async function Page() {
  const shelter = (await getCurrentShelter()) ?? null;
  const shareUrl = env.VERCEL_URL ?? "https://helperbuddy.org";

  const kennelRooms = shelter?.kennelRooms;
  const kennelRoom = kennelRooms?.[0];

  if (!kennelRoom) {
    return <div>No kennel rooms found</div>;
  }

  return (
    <main className="container mx-auto py-16">
      <div className="grid gap-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <H1>Welcome to Shelter Buddy</H1>
          <div className="flex w-full max-w-2xl flex-col items-center gap-4">
            <Button asChild size="lg">
              <Link
                href={`/shelters/${shelter?.id}/rooms/${kennelRoom.id}/kennels`}
              >
                Go to Kennels
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid max-w-2xl justify-center gap-8 px-4">
          <div className="grid gap-2 text-center">
            <h2 className="text-4xl font-bold">Share Shelter Buddy</h2>
          </div>

          <div className="mx-auto">
            <QRCodeSVG
              value={shareUrl}
              size={200}
              className="rounded-lg"
              includeMargin
            />
          </div>
        </div>
      </div>
    </main>
  );
}
