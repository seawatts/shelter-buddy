import { Skeleton } from "@acme/ui/skeleton";

export default function WalkLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" /> {/* Back button */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-6 w-32" /> {/* Title */}
              <Skeleton className="h-4 w-24" /> {/* Subtitle */}
            </div>
          </div>
          <Skeleton className="h-10 w-24" /> {/* Action button */}
        </div>
      </div>

      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Animal Info */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-lg" /> {/* Animal photo */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48" /> {/* Animal name */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>

          {/* Walk Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-2 h-6 w-24" />
              </div>
            ))}
          </div>

          {/* Activity Sections */}
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <Skeleton className="h-6 w-32" /> {/* Section title */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, buttonIndex) => (
                  <Skeleton
                    key={buttonIndex}
                    className="h-10 w-full rounded-lg"
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Notes Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
