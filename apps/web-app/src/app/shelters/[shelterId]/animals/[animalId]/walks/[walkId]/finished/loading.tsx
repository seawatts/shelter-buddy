import { Skeleton } from "@acme/ui/skeleton";

export default function WalkFinishedLoading() {
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
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" /> {/* Action button */}
            <Skeleton className="h-10 w-24" /> {/* Action button */}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Walk Summary */}
          <div className="rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              {/* Duration and Stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>

              {/* Animal Info */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sections */}
          {Array.from({ length: 3 }).map((_, sectionGroupIndex) => (
            <div key={sectionGroupIndex} className="space-y-6">
              <Skeleton className="h-6 w-48" /> {/* Section group title */}
              {/* Activity Sections */}
              {Array.from({ length: 2 }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <Skeleton className="h-5 w-32" /> {/* Section title */}
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
