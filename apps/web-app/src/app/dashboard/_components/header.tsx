import { H1 } from "@acme/ui/typography";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <H1>Dashboard</H1>
      <div className="flex items-center gap-4">
        {/* Add any additional header controls here */}
      </div>
    </div>
  );
}
