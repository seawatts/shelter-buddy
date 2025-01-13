import { Skeleton } from "@acme/ui/skeleton";

export default function AnimalDetailsLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Animal Profile Section */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Left Column - Photo and Quick Info */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details and Tabs */}
          <div className="flex flex-col gap-6">
            {/* Basic Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Tabs */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 border-b">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-24" />
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
