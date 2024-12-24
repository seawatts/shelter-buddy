import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

// This would normally fetch from an API
async function getVolunteerData(id: string) {
  // Mock data for demonstration
  return {
    email: "sarah.j@example.com",
    id,
    name: "Sarah Johnson",
    phone: "(555) 123-4567",
    preferredAreas: ["Dog Walking", "Cat Socialization"],
    recentActivity: [
      {
        date: "2024-01-15",
        hours: 4,
        notes: "Walked Max, Luna, and Charlie. All dogs well-behaved.",
        type: "Dog Walking",
      },
      {
        date: "2024-01-12",
        hours: 3,
        notes: "Spent time with new cat arrivals. Helped with feeding.",
        type: "Cat Socialization",
      },
      {
        date: "2024-01-10",
        hours: 4,
        notes: "Assisted with basic training for two new dogs.",
        type: "Dog Walking",
      },
    ],
    schedule: {
      monday: "9:00 AM - 1:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      wednesday: "2:00 PM - 6:00 PM",
    },
    startDate: "2023-06-15",
    status: "Active",
    totalHours: 156,
  };
}

export default async function VolunteerPage({
  params,
}: {
  params: { id: string };
}) {
  const volunteer = await getVolunteerData(params.id);

  return (
    <div className="container mx-auto py-8">
      {/* Volunteer Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${volunteer.name}`}
            />
            <AvatarFallback>
              {volunteer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{volunteer.name}</h1>
            <div className="mt-2 flex gap-2">
              <Badge
                variant={
                  volunteer.status === "Active" ? "default" : "secondary"
                }
              >
                {volunteer.status}
              </Badge>
              <Badge variant="outline">
                {volunteer.totalHours} Hours Contributed
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div>{volunteer.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div>{volunteer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div>{new Date(volunteer.startDate).toLocaleDateString()}</div>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Regular Schedule</h2>
          <div className="space-y-3">
            {Object.entries(volunteer.schedule).map(([day, time]) => (
              <div key={day}>
                <div className="text-sm capitalize text-muted-foreground">
                  {day}
                </div>
                <div>{time}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Preferred Areas */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Preferred Areas</h2>
          <div className="flex flex-wrap gap-2">
            {volunteer.preferredAreas.map((area) => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {volunteer.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{activity.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 text-sm">{activity.notes}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Hours: {activity.hours}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity History Table */}
      <Card className="mt-8 p-6">
        <h2 className="mb-4 text-xl font-semibold">Activity History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteer.recentActivity.map((activity, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(activity.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{activity.type}</TableCell>
                <TableCell>{activity.hours}</TableCell>
                <TableCell>{activity.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
