import { Skeleton } from "@acme/ui/skeleton";

export default function IntakeLoading() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="relative mx-auto">
            <Skeleton className="size-64" />
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
