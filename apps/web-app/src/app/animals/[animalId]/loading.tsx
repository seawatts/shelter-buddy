import { Icons } from "@acme/ui/icons";

export default function WalkLoading() {
  return (
    <div className="grid h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-2">
        <Icons.Spinner className="animate-spin" />
        <p className="text-sm text-muted-foreground">Loading walk session...</p>
      </div>
    </div>
  );
}
