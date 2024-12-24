import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

// This would normally fetch from an API
async function getSheltersData() {
  // Mock data for demonstration
  return [
    {
      address: "123 Main Street, San Francisco, CA 94105",
      currentAnimals: {
        cats: 38,
        dogs: 45,
        other: 12,
      },
      email: "info@pawsandwhiskers.org",
      id: "1",
      lastUpdated: "2024-01-15",
      name: "Paws & Whiskers Shelter",
      openHours: {
        weekday: "9:00 AM - 6:00 PM",
        weekend: "10:00 AM - 4:00 PM",
      },
      phone: "(415) 555-0123",
      status: "Open",
      urgentNeeds: ["Foster Homes", "Dog Food", "Cat Litter"],
    },
    {
      address: "456 Oak Avenue, San Francisco, CA 94110",
      currentAnimals: {
        cats: 50,
        dogs: 32,
        other: 8,
      },
      email: "contact@happytails.org",
      id: "2",
      lastUpdated: "2024-01-16",
      name: "Happy Tails Haven",
      openHours: {
        weekday: "8:00 AM - 7:00 PM",
        weekend: "9:00 AM - 5:00 PM",
      },
      phone: "(415) 555-0456",
      status: "Open",
      urgentNeeds: ["Volunteers", "Blankets"],
    },
    {
      address: "789 Pine Street, San Francisco, CA 94115",
      currentAnimals: {
        cats: 42,
        dogs: 55,
        other: 15,
      },
      email: "help@secondchance.org",
      id: "3",
      lastUpdated: "2024-01-14",
      name: "Second Chance Animal Center",
      openHours: {
        weekday: "10:00 AM - 6:00 PM",
        weekend: "11:00 AM - 4:00 PM",
      },
      phone: "(415) 555-0789",
      status: "Limited Capacity",
      urgentNeeds: ["Foster Homes", "Medical Supplies"],
    },
  ];
}

export default async function SheltersPage() {
  const shelters = await getSheltersData();

  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Animal Shelters</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find local animal shelters and their current needs
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div>
          <Input
            type="search"
            placeholder="Search shelters..."
            className="w-full"
          />
        </div>
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="limited">Limited Capacity</SelectItem>
              <SelectItem value="closed">Temporarily Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="capacity">Current Capacity</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shelters.map((shelter) => (
          <Card key={shelter.id} className="flex flex-col p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{shelter.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shelter.address}
                </p>
              </div>
              <Badge
                variant={
                  shelter.status === "Open"
                    ? "default"
                    : shelter.status === "Limited Capacity"
                      ? "secondary"
                      : "destructive"
                }
              >
                {shelter.status}
              </Badge>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {shelter.currentAnimals.dogs}
                </div>
                <div className="text-sm text-muted-foreground">Dogs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {shelter.currentAnimals.cats}
                </div>
                <div className="text-sm text-muted-foreground">Cats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {shelter.currentAnimals.other}
                </div>
                <div className="text-sm text-muted-foreground">Other</div>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div>
                <div className="text-sm font-medium">Hours</div>
                <div className="text-sm">
                  Weekdays: {shelter.openHours.weekday}
                </div>
                <div className="text-sm">
                  Weekends: {shelter.openHours.weekend}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium">Urgent Needs</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {shelter.urgentNeeds.map((need) => (
                  <Badge key={need} variant="outline">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Last updated:{" "}
                  {new Date(shelter.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="default">
                  Contact
                </Button>
                <Button className="flex-1" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
