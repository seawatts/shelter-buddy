import { Skeleton } from "@acme/ui/skeleton";

export default function KennelsLoading() {
  return (
    <div>
      <div className="sticky top-0 z-10 flex flex-col gap-4 bg-background p-4 sm:gap-8 sm:p-8">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-9 w-64 sm:h-10" />
            <Skeleton className="mt-1 h-6 w-48" />
          </div>
        </div>

        {/* Walk Progress skeleton */}
        <div className="flex w-full justify-center">
          <div className="grid w-full grid-cols-2 gap-4 sm:min-w-[640px] sm:max-w-[800px] sm:grid-cols-1 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="relative">
                  <div className="relative h-10 w-full overflow-hidden rounded-xl border-4 border-muted md:h-12">
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className="flex items-center justify-center gap-6">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kennel Grid skeleton */}
      <div className="flex w-full justify-center p-4 sm:p-8">
        <div className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4">
          {Array.from({ length: 32 }).map((_, index) => (
            <div key={index} className="relative">
              <div className="flex h-14 items-center justify-between rounded-full border-4 border-dashed border-muted p-3">
                <div className="flex min-w-0 flex-1 items-center justify-between">
                  <div className="min-w-0 truncate">
                    <div className="text-sm font-medium">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
