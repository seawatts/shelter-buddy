import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { Skeleton } from "@acme/ui/skeleton";
import { H1 } from "@acme/ui/typography";

export default function Loading() {
  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <H1>Welcome to Shelter Buddy</H1>
        <div className="flex w-full max-w-2xl flex-col items-center gap-4">
          <Button disabled size="lg" variant="outline">
            <Icons.Spinner className="mr-2" size="sm" variant="primary" />
            Loading Kennels...
          </Button>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
