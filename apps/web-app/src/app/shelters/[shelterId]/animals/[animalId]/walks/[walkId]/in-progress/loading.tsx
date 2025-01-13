import { Skeleton } from "@acme/ui/skeleton";

export default function WalkInProgressLoading() {
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

      {/* Timer and Actions */}
      <div className="container flex min-h-[calc(100vh-96px)] max-w-3xl flex-col items-center justify-center gap-8 pb-24">
        <div className="flex w-full flex-col items-center justify-center gap-8">
          {/* Timer */}
          <div className="text-center">
            <Skeleton className="mx-auto h-16 w-32 text-6xl" />{" "}
            {/* Timer display */}
            <Skeleton className="mx-auto mt-2 h-4 w-24" /> {/* Timer label */}
          </div>

          {/* Kennel Info */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" /> {/* Return to kennel text */}
            <Skeleton className="h-8 w-16 rounded-full" /> {/* Kennel number */}
          </div>

          {/* Photo Upload Area */}
          <div className="w-full max-w-sm rounded-lg border-2 border-dashed p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* End Walk Button */}
          <div className="flex w-full max-w-sm flex-col gap-4">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
