"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="grid min-h-[80vh] place-items-center">
      <div className="grid place-items-center gap-6 text-center">
        <div className="grid gap-2">
          <div className="flex items-center justify-center gap-4">
            <Icons.AlertCircle size="2xl" variant="muted" />
            <h1 className="text-4xl font-bold">Page not found</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </div>
        <Button onClick={() => router.push("/")} className="gap-2">
          <Icons.Home size="sm" />
          Go back home
        </Button>
      </div>
    </div>
  );
}
