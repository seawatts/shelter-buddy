"use client";

import { differenceInDays } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import type { AnimalType } from "@acme/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@acme/ui/chart";
import { Icons } from "@acme/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

interface DashboardChartsProps {
  walksByDay: {
    date: string;
    walks: number;
  }[];
  activityStats: Record<string, number>;
  animals: (AnimalType & {
    kennelOccupants: {
      startedAt: Date;
      kennel: {
        id: string;
        name: string;
        type: string;
      };
    }[];
    activities: {
      category: string;
      type: string;
      severity: string;
      createdAt: Date;
    }[];
  })[];
  totalKennels: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

interface AdoptionScore {
  name: string;
  total: number;
  factors: {
    behavior: number;
    training: number;
    socialization: number;
    health: number;
    exercise: number;
  };
}

interface AttentionScore {
  lastBathroom: number; // Hours since last bathroom break
  lastMeal: number; // Hours since last meal
  lastWater: number; // Hours since last water check
  medicationDue: boolean; // Whether medication is due
  name: string;
  score: number; // Overall urgency score
  temperatureCheck: boolean; // Whether temperature check is needed
  waterBowlCheck: boolean; // Whether water bowl needs checking
}

export function DashboardCharts({
  walksByDay,
  activityStats,
  animals,
  totalKennels,
}: DashboardChartsProps) {
  // Calculate breed statistics
  const breedStats: Record<string, number> = {};
  for (const animal of animals) {
    if (!animal.breed) continue;
    breedStats[animal.breed] = (breedStats[animal.breed] ?? 0) + 1;
  }

  const breedData = Object.entries(breedStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 breeds

  // Calculate age groups
  const ageGroups = {
    // 1-3 years
    adult: 0,

    puppy: 0,

    // 3-7 years
    senior: 0,

    // 7+ years
    unknown: 0,
    // 0-1 year
    young: 0,
  };

  for (const animal of animals) {
    if (!animal.birthDate) {
      ageGroups.unknown++;
      continue;
    }

    const ageInYears =
      (Date.now() - new Date(animal.birthDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365);

    if (ageInYears < 1) ageGroups.puppy++;
    else if (ageInYears < 3) ageGroups.young++;
    else if (ageInYears < 7) ageGroups.adult++;
    else ageGroups.senior++;
  }

  const ageData = Object.entries(ageGroups).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Calculate kennel time statistics
  const kennelTimeData = animals
    .filter((animal) => animal.kennelOccupants.length > 0)
    .map((animal) => {
      const occupant = animal.kennelOccupants[0];
      if (!occupant) {
        return {
          days: 0,
          name: animal.name,
        };
      }
      return {
        days: differenceInDays(new Date(), occupant.startedAt),
        name: animal.name,
      };
    })
    .sort((a, b) => b.days - a.days)
    .slice(0, 10); // Top 10 longest stays

  // Calculate kennel occupancy
  let occupiedKennels = 0;
  for (const animal of animals) {
    if (animal.kennelOccupants.length > 0 && animal.kennelOccupants[0]) {
      occupiedKennels++;
    }
  }

  const kennelOccupancyData = [
    { name: "Occupied", value: occupiedKennels },
    { name: "Available", value: totalKennels - occupiedKennels },
  ];

  // Calculate walk deficits (animals with less than recommended walks)
  const walkDeficitData = animals
    .map((animal) => {
      const walksLastWeek = animal.activities.filter(
        (activity) =>
          new Date(activity.createdAt) >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
          activity.category === "walk",
      ).length;
      const recommendedWalks = 14; // 2 walks per day
      const deficit = Math.max(0, recommendedWalks - walksLastWeek);
      return {
        completed: walksLastWeek,
        deficit,
        name: animal.name,
      };
    })
    .filter((data) => data.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit)
    .slice(0, 10);

  // Calculate behavioral improvement trends
  const behavioralTrends = animals.map((animal) => {
    const weeklyBehaviorStats = Array.from({ length: 4 }, (_, weekIndex) => {
      const weekStart = new Date(
        Date.now() - (4 - weekIndex) * 7 * 24 * 60 * 60 * 1000,
      );
      const weekEnd = new Date(
        Date.now() - (3 - weekIndex) * 7 * 24 * 60 * 60 * 1000,
      );

      const goodBehaviors = animal.activities.filter(
        (activity) =>
          activity.category === "behavior" &&
          activity.type.startsWith("good_") &&
          new Date(activity.createdAt) >= weekStart &&
          new Date(activity.createdAt) < weekEnd,
      ).length;

      const incidents = animal.activities.filter(
        (activity) =>
          activity.category === "behavior" &&
          activity.severity !== "info" &&
          new Date(activity.createdAt) >= weekStart &&
          new Date(activity.createdAt) < weekEnd,
      ).length;

      return {
        goodBehaviors,
        incidents,
        week: `Week ${weekIndex + 1}`,
      };
    });

    return {
      data: weeklyBehaviorStats,
      name: animal.name,
    };
  });

  // Get top 5 animals with most improvement
  const topImprovers = behavioralTrends
    .map((trend) => {
      const firstWeek = trend.data[0];
      const lastWeek = trend.data[3];
      if (!firstWeek || !lastWeek) return null;

      const improvement =
        lastWeek.goodBehaviors / (lastWeek.incidents || 1) -
        firstWeek.goodBehaviors / (firstWeek.incidents || 1);

      return {
        data: trend.data,
        improvement,
        name: trend.name,
      };
    })
    .filter(
      (improver): improver is NonNullable<typeof improver> => improver !== null,
    )
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5);

  // Calculate adoption success predictors
  const adoptionScores: AdoptionScore[] = animals.map((animal) => {
    // Breed-specific factors (0-100)
    const breedScore = (() => {
      if (!animal.breed) return 50; // Default score for unknown breeds

      // Common breed characteristics that affect adoption
      const breedFactors: Record<string, number> = {
        // Sorted alphabetically with categorization comments
        akita: 8,
        "alaskan malamute": 8,
        "australian cattle dog": 8,
        beagle: 15, // Good with children
        "belgian malinois": 8, // Active breed
        "bernese mountain dog": 18, // Family-friendly
        "border collie": 8, // Active breed
        "boston terrier": 15, // Good with children
        "cavalier king charles spaniel": 18, // Family-friendly
        chihuahua: 12, // Apartment-friendly
        "chow chow": 8,
        // Good with children
        "cocker spaniel": 15,
        // Special considerations
        collie: 15, // Good with children
        doberman: 10, // Active breed
        "french bulldog": 12, // Apartment-friendly
        "german shepherd": 10, // Active breed
        "golden retriever": 20, // Highly family-friendly
        "great dane": 10, // Special considerations
        havanese: 15, // Good with children
        husky: 8, // Active breed
        "labrador retriever": 20, // Highly family-friendly
        maltese: 12, // Apartment-friendly
        newfoundland: 18, // Family-friendly
        "pit bull": 10, // Special considerations
        poodle: 15, // Good with children
        pug: 15, // Good with children
        rottweiler: 10, // Active breed
        "saint bernard": 10, // Special considerations
        "shih tzu": 12, // Apartment-friendly
        "yorkshire terrier": 12, // Apartment-friendly
      };

      // Base score for all breeds
      let score = 50;

      // Add breed-specific bonus/adjustment
      const breedLower = animal.breed.toLowerCase();
      const breedAdjustment = breedFactors[breedLower] ?? 0;
      score += breedAdjustment;

      // Additional breed-specific adjustments
      const breedTraits = {
        // Breeds good with other pets
        goodWithPets: [
          "golden retriever",
          "labrador retriever",
          "beagle",
          "pug",
          "collie",
          "bernese mountain dog",
        ],

        // Breeds requiring minimal grooming
        lowMaintenance: [
          "beagle",
          "chihuahua",
          "pug",
          "boston terrier",
          "french bulldog",
          "german shorthaired pointer",
        ],

        // Breeds good for first-time owners
        noviceFriendly: [
          "golden retriever",
          "labrador retriever",
          "poodle",
          "cavalier king charles spaniel",
          "pug",
          "boston terrier",
        ],

        // Breeds with lower exercise needs
        relaxed: [
          "bulldog",
          "basset hound",
          "chow chow",
          "great dane",
          "newfoundland",
          "saint bernard",
        ],
      };

      // Apply trait-based adjustments
      if (breedTraits.goodWithPets.includes(breedLower)) score += 5;
      if (breedTraits.lowMaintenance.includes(breedLower)) score += 5;
      if (breedTraits.noviceFriendly.includes(breedLower)) score += 5;
      if (breedTraits.relaxed.includes(breedLower)) score += 5;

      // Adjust for age preferences
      if (animal.birthDate) {
        const ageInYears =
          (Date.now() - new Date(animal.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365);
        if (ageInYears < 2)
          score += 15; // Puppies and young dogs
        else if (ageInYears > 7) score -= 10; // Senior dogs may need more care
      }

      return Math.max(0, Math.min(100, score));
    })();

    // Behavior score (0-100)
    const behaviorScore = (() => {
      const recentActivities = animal.activities.filter(
        (activity) =>
          activity.category === "behavior" &&
          new Date(activity.createdAt) >=
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      );

      const goodBehaviors = recentActivities.filter((activity) =>
        activity.type.startsWith("good_"),
      ).length;

      const incidents = recentActivities.filter(
        (activity) =>
          activity.severity === "high" || activity.severity === "critical",
      ).length;

      const baseScore = goodBehaviors * 10 - incidents * 20;
      return Math.max(0, Math.min(100, baseScore));
    })();

    // Training score (0-100)
    const trainingScore = (() => {
      const knownCommands = animal.activities.filter(
        (activity) =>
          activity.category === "behavior" &&
          activity.type.startsWith("knows_"),
      ).length;

      return Math.min(100, knownCommands * 15);
    })();

    // Socialization score (0-100)
    const socializationScore = (() => {
      const positiveInteractions = animal.activities.filter(
        (activity) =>
          (activity.category === "behavior" &&
            (activity.type === "focused_on_handler" ||
              activity.type === "calm_in_new_places")) ||
          activity.type === "takes_treats_gently",
      ).length;

      const negativeInteractions = animal.activities.filter(
        (activity) =>
          activity.category === "behavior" &&
          (activity.type === "dog_reactive" ||
            activity.type === "human_reactive" ||
            activity.type === "aggressive"),
      ).length;

      const baseScore = positiveInteractions * 15 - negativeInteractions * 25;
      return Math.max(0, Math.min(100, baseScore));
    })();

    // Health score (0-100)
    const healthScore = (() => {
      const healthIssues = animal.activities.filter(
        (activity) =>
          activity.category === "health" &&
          new Date(activity.createdAt) >=
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ).length;

      return Math.max(0, 100 - healthIssues * 15);
    })();

    // Exercise compliance score (0-100)
    const exerciseScore = (() => {
      const recentWalks = animal.activities.filter(
        (activity) =>
          activity.category === "walk" &&
          new Date(activity.createdAt) >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length;

      const targetWalks = 14; // 2 walks per day
      return Math.min(100, (recentWalks / targetWalks) * 100);
    })();

    // Calculate weighted total (weights should sum to 1)
    const total = Math.round(
      behaviorScore * 0.25 +
        trainingScore * 0.15 +
        socializationScore * 0.2 +
        healthScore * 0.15 +
        exerciseScore * 0.1 +
        breedScore * 0.15,
    );

    return {
      factors: {
        behavior: behaviorScore,
        breed: breedScore,
        exercise: exerciseScore,
        health: healthScore,
        socialization: socializationScore,
        training: trainingScore,
      },
      name: animal.name,
      total,
    };
  });

  // Sort by total score and get top candidates
  const topAdoptionCandidates = adoptionScores
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Prepare data for radar chart
  const radarData = Object.keys(topAdoptionCandidates[0]?.factors ?? {}).map(
    (factor) => ({
      factor,
      ...Object.fromEntries(
        topAdoptionCandidates.map((candidate) => [
          candidate.name,
          candidate.factors[factor as keyof typeof candidate.factors],
        ]),
      ),
    }),
  );

  // Calculate attention scores for each animal
  const attentionScores: AttentionScore[] = animals.map((animal) => {
    const now = new Date();

    // Find last bathroom activity
    const lastBathroomActivity = animal.activities
      .filter(
        (activity) =>
          activity.category === "bathroom" ||
          activity.type === "potty_break" ||
          activity.type === "bathroom_check",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    // Find last meal activity
    const lastMealActivity = animal.activities
      .filter(
        (activity) =>
          activity.category === "feeding" ||
          activity.type === "meal" ||
          activity.type === "food_check",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    // Find last water check
    const lastWaterActivity = animal.activities
      .filter(
        (activity) =>
          activity.category === "feeding" && activity.type === "water_check",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    // Calculate hours since last activities
    const lastBathroom = lastBathroomActivity
      ? Math.round(
          (now.getTime() - new Date(lastBathroomActivity.createdAt).getTime()) /
            (1000 * 60 * 60),
        )
      : 24; // Default to 24 hours if no record

    const lastMeal = lastMealActivity
      ? Math.round(
          (now.getTime() - new Date(lastMealActivity.createdAt).getTime()) /
            (1000 * 60 * 60),
        )
      : 12; // Default to 12 hours if no record

    const lastWater = lastWaterActivity
      ? Math.round(
          (now.getTime() - new Date(lastWaterActivity.createdAt).getTime()) /
            (1000 * 60 * 60),
        )
      : 8; // Default to 8 hours if no record

    // Check for due medications
    const medicationDue = animal.activities
      .filter(
        (activity) =>
          activity.category === "health" && activity.type === "medication_due",
      )
      .some((activity) => new Date(activity.createdAt) <= now);

    // Calculate temperature check need (every 12 hours for sick animals)
    const isSick = animal.activities
      .filter(
        (activity) =>
          activity.category === "health" && activity.severity === "high",
      )
      .some(
        (activity) =>
          new Date(activity.createdAt) >=
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      );

    const lastTemporaryCheck = animal.activities
      .filter((activity) => activity.type === "temperature_check")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    const temperatureCheck =
      isSick &&
      (!lastTemporaryCheck ||
        new Date(lastTemporaryCheck.createdAt).getTime() <=
          now.getTime() - 12 * 60 * 60 * 1000);

    // Calculate water bowl check need (more frequent for high-energy breeds)
    const isHighEnergy = [
      "husky",
      "belgian malinois",
      "border collie",
      "australian cattle dog",
      "german shepherd",
    ].includes(animal.breed?.toLowerCase() ?? "");

    const waterCheckInterval = isHighEnergy ? 4 : 6; // Hours between checks
    const waterBowlCheck =
      !lastWaterActivity ||
      new Date(lastWaterActivity.createdAt).getTime() <=
        now.getTime() - waterCheckInterval * 60 * 60 * 1000;

    // Calculate urgency score (0-100)
    const score = (() => {
      let urgencyScore = 0;

      // Bathroom urgency (0-30 points)
      if (lastBathroom >= 8) urgencyScore += 30;
      else if (lastBathroom >= 6) urgencyScore += 20;
      else if (lastBathroom >= 4) urgencyScore += 10;

      // Meal urgency (0-20 points)
      if (lastMeal >= 12) urgencyScore += 20;
      else if (lastMeal >= 8) urgencyScore += 15;
      else if (lastMeal >= 6) urgencyScore += 10;

      // Water urgency (0-20 points)
      if (lastWater >= 6) urgencyScore += 20;
      else if (lastWater >= 4) urgencyScore += 15;
      else if (lastWater >= 2) urgencyScore += 10;

      // Medical urgency (0-30 points)
      if (medicationDue) urgencyScore += 20;
      if (temperatureCheck) urgencyScore += 10;

      return Math.min(100, urgencyScore);
    })();

    return {
      lastBathroom,
      lastMeal,
      lastWater,
      medicationDue,
      name: animal.name,
      score,
      temperatureCheck,
      waterBowlCheck,
    };
  });

  // Sort by urgency score and get top attention needs
  const urgentAttentionNeeds = attentionScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const chartConfig = {
    walks: {
      label: "Walks",
      theme: {
        dark: "hsl(var(--primary))",
        light: "hsl(var(--primary))",
      },
    },
  };

  return (
    <div className="grid gap-6">
      {/* Walk Trends & Activity Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">Walk Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] w-full md:h-[300px]"
              config={chartConfig}
            >
              <AreaChart data={walksByDay}>
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Area
                  type="monotone"
                  dataKey="walks"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">
              Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] w-full md:h-[300px]"
              config={chartConfig}
            >
              <BarChart
                data={Object.entries(activityStats).map(([name, value]) => ({
                  name,
                  value,
                }))}
              >
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Population Demographics & Kennel Stays */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">
              Population Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="breed" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="breed">Breeds</TabsTrigger>
                <TabsTrigger value="age">Age Groups</TabsTrigger>
              </TabsList>
              <div className="pt-2">
                <TabsContent value="breed">
                  <ChartContainer
                    className="h-[200px] w-full md:h-[300px]"
                    config={chartConfig}
                  >
                    <PieChart>
                      <Pie
                        data={breedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {breedData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="age">
                  <ChartContainer
                    className="h-[200px] w-full md:h-[300px]"
                    config={chartConfig}
                  >
                    <PieChart>
                      <Pie
                        data={ageData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {ageData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">
              Longest Kennel Stays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] w-full md:h-[300px]"
              config={chartConfig}
            >
              <BarChart
                data={kennelTimeData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar
                  dataKey="days"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `${label} (days)`}
                    />
                  }
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Kennel Occupancy & Walk Deficits */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">
              Kennel Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] w-full md:h-[300px]"
              config={chartConfig}
            >
              <PieChart>
                <Pie
                  data={kennelOccupancyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {kennelOccupancyData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg md:text-xl">Walk Deficits</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] w-full md:h-[300px]"
              config={chartConfig}
            >
              <BarChart
                data={walkDeficitData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar
                  dataKey="completed"
                  stackId="walks"
                  fill="hsl(var(--primary))"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="deficit"
                  stackId="walks"
                  fill="hsl(var(--destructive))"
                  radius={[0, 4, 4, 0]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `${label} (walks)`}
                    />
                  }
                />
                <Legend />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Improvement Trends */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg md:text-xl">
            Behavioral Improvement Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={topImprovers[0]?.name} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2 md:grid-cols-5">
              {topImprovers.map((improver) => (
                <TabsTrigger
                  key={improver.name}
                  value={improver.name}
                  className="text-xs md:text-sm"
                >
                  {improver.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="pt-2">
              {topImprovers.map((improver) => (
                <TabsContent key={improver.name} value={improver.name}>
                  <ChartContainer
                    className="h-[200px] w-full md:h-[300px]"
                    config={chartConfig}
                  >
                    <LineChart data={improver.data}>
                      <XAxis
                        dataKey="week"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="goodBehaviors"
                        name="Good Behaviors"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot
                      />
                      <Line
                        type="monotone"
                        dataKey="incidents"
                        name="Incidents"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Adoption Success Predictors */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg md:text-xl">
            Adoption Success Predictors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-base font-semibold md:text-lg">
                Top Adoption Candidates
              </h3>
              <div className="space-y-4">
                {topAdoptionCandidates.map((candidate) => (
                  <div
                    key={candidate.name}
                    className="flex flex-col justify-between gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Overall Score: {candidate.total}%
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:flex">
                      {Object.entries(candidate.factors).map(
                        ([factor, score]) => (
                          <div
                            key={factor}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="text-xs capitalize text-muted-foreground">
                              {factor}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                score >= 70
                                  ? "text-green-500"
                                  : score >= 40
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            >
                              {score}%
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-base font-semibold md:text-lg">
                Factor Comparison
              </h3>
              <ChartContainer
                className="h-[300px] w-full md:h-[400px]"
                config={chartConfig}
              >
                <BarChart
                  data={radarData}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="factor"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  {topAdoptionCandidates.map((candidate, index) => (
                    <Bar
                      key={candidate.name}
                      dataKey={candidate.name}
                      fill={COLORS[index % COLORS.length]}
                      radius={[0, 4, 4, 0]}
                      stackId="stack"
                    />
                  ))}
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Attention Needed */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg md:text-xl">
            Immediate Attention Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-base font-semibold md:text-lg">
                Urgent Care Required
              </h3>
              <div className="space-y-4">
                {urgentAttentionNeeds.map((need) => (
                  <div
                    key={need.name}
                    className="flex flex-col justify-between gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{need.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Urgency Score:{" "}
                        <span
                          className={
                            need.score >= 70
                              ? "font-medium text-destructive"
                              : need.score >= 40
                                ? "text-warning font-medium"
                                : "text-muted-foreground"
                          }
                        >
                          {need.score}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:flex">
                      {need.lastBathroom >= 4 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Bathroom
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.Clock
                              size="sm"
                              variant={
                                need.lastBathroom >= 8
                                  ? "destructive"
                                  : "warning"
                              }
                            />
                            <span
                              className={
                                need.lastBathroom >= 8
                                  ? "font-medium text-destructive"
                                  : "text-warning font-medium"
                              }
                            >
                              {need.lastBathroom}h
                            </span>
                          </div>
                        </div>
                      )}
                      {need.lastMeal >= 6 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Meal
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.AlertTriangle
                              size="sm"
                              variant={
                                need.lastMeal >= 12 ? "destructive" : "warning"
                              }
                            />
                            <span
                              className={
                                need.lastMeal >= 12
                                  ? "font-medium text-destructive"
                                  : "text-warning font-medium"
                              }
                            >
                              {need.lastMeal}h
                            </span>
                          </div>
                        </div>
                      )}
                      {need.lastWater >= 2 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Water
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.AlertTriangle
                              size="sm"
                              variant={
                                need.lastWater >= 6 ? "destructive" : "warning"
                              }
                            />
                            <span
                              className={
                                need.lastWater >= 6
                                  ? "font-medium text-destructive"
                                  : "text-warning font-medium"
                              }
                            >
                              {need.lastWater}h
                            </span>
                          </div>
                        </div>
                      )}
                      {need.medicationDue && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Meds
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.AlertCircle
                              size="sm"
                              variant="destructive"
                            />
                            <span className="font-medium text-destructive">
                              Due
                            </span>
                          </div>
                        </div>
                      )}
                      {need.temperatureCheck && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Temp
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.Activity size="sm" variant="warning" />
                            <span className="text-warning font-medium">
                              Check
                            </span>
                          </div>
                        </div>
                      )}
                      {need.waterBowlCheck && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Bowl
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.AlertTriangle size="sm" variant="warning" />
                            <span className="text-warning font-medium">
                              Check
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-base font-semibold md:text-lg">
                Care Statistics
              </h3>
              <ChartContainer
                className="h-[300px] w-full md:h-[400px]"
                config={chartConfig}
              >
                <BarChart
                  data={[
                    {
                      name: "Bathroom Check",
                      value: attentionScores.filter((s) => s.lastBathroom >= 4)
                        .length,
                    },
                    {
                      name: "Meal Due",
                      value: attentionScores.filter((s) => s.lastMeal >= 6)
                        .length,
                    },
                    {
                      name: "Water Check",
                      value: attentionScores.filter((s) => s.waterBowlCheck)
                        .length,
                    },
                    {
                      name: "Medication",
                      value: attentionScores.filter((s) => s.medicationDue)
                        .length,
                    },
                    {
                      name: "Temperature",
                      value: attentionScores.filter((s) => s.temperatureCheck)
                        .length,
                    },
                  ]}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
