import type { AnimalActivityType, WalkType } from "@acme/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";

interface DashboardStatsProps {
  walks: WalkType[];
  activities: AnimalActivityType[];
}

export function DashboardStats({ walks, activities }: DashboardStatsProps) {
  const totalWalks = walks.length;
  const completedWalks = walks.filter(
    (walk) => walk.status === "completed",
  ).length;
  const totalActivities = activities.length;
  const uniqueAnimals = new Set(walks.map((walk) => walk.animalId)).size;

  let totalDuration = 0;
  for (const walk of walks) {
    if (!walk.endedAt) continue;
    totalDuration +=
      (walk.endedAt.getTime() - walk.startedAt.getTime()) / (1000 * 60);
  }
  const avgDuration =
    walks.length > 0 ? Math.round(totalDuration / walks.length) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Walks</CardTitle>
          <Icons.ArrowUpRight className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWalks}</div>
          <p className="text-xs text-muted-foreground">
            {completedWalks} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Animals</CardTitle>
          <Icons.Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueAnimals}</div>
          <p className="text-xs text-muted-foreground">In the last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activities</CardTitle>
          <Icons.Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActivities}</div>
          <p className="text-xs text-muted-foreground">Recorded during walks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Walk Duration
          </CardTitle>
          <Icons.Clock size="sm" variant="muted" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgDuration}m</div>
          <p className="text-xs text-muted-foreground">Minutes per walk</p>
        </CardContent>
      </Card>
    </div>
  );
}
