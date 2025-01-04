import { endOfDay, startOfDay, subDays } from "date-fns";
import { and, gte, isNull, lte } from "drizzle-orm";

import { db } from "@acme/db/client";
import { AnimalActivities, KennelOccupants, Walks } from "@acme/db/schema";

import { ScrollToBottom } from "../../components/scroll-to-bottom";
import { AdoptionReadiness } from "./_components/adoption-readiness";
import { BehavioralInsights } from "./_components/behavioral-insights";
import { DashboardCharts } from "./_components/charts";
import { DashboardHeader } from "./_components/header";
import { KennelStatus } from "./_components/kennel-status";
import { MedicalIssues } from "./_components/medical-issues";
import { DashboardStats } from "./_components/stats";
import { VolunteerNeeds } from "./_components/volunteer-needs";

export default async function DashboardPage() {
  const today = new Date();
  const startDate = startOfDay(today);
  const endDate = endOfDay(today);
  const weekStartDate = startOfDay(subDays(today, 7));

  // Fetch all kennels
  const kennels = await db.query.Kennels.findMany();

  // Fetch all animals with their activities, notes, and tags
  const animals = await db.query.Animals.findMany({
    with: {
      activities: true,
      kennelOccupants: {
        where: isNull(KennelOccupants.endedAt),
        with: {
          kennel: true,
        },
      },
      notes: true,
      tags: true,
      walks: {
        where: and(
          gte(Walks.startedAt, weekStartDate),
          lte(Walks.startedAt, endDate),
        ),
        with: {
          activities: true,
        },
      },
    },
  });

  // Today's walks data
  const todaysWalks = await db.query.Walks.findMany({
    where: and(gte(Walks.startedAt, startDate), lte(Walks.startedAt, endDate)),
    with: {
      activities: true,
      animal: true,
      user: true,
    },
  });

  // Week's walks data for trends
  const weeksWalks = await db.query.Walks.findMany({
    where: and(
      gte(Walks.startedAt, weekStartDate),
      lte(Walks.startedAt, endDate),
    ),
    with: {
      activities: true,
      animal: true,
      user: true,
    },
  });

  // Recent activities
  const activities = await db.query.AnimalActivities.findMany({
    where: and(
      gte(AnimalActivities.createdAt, weekStartDate),
      lte(AnimalActivities.createdAt, endDate),
    ),
    with: {
      animal: true,
      createdByUser: true,
    },
  });

  // Prepare volunteer needs data
  const volunteerNeeds = {
    highEnergyPriority: animals.filter((animal) =>
      animal.activities.some(
        (activity) =>
          activity.category === "behavior" && activity.type === "pulls_hard",
      ),
    ),
    needsSocialization: animals.filter((animal) =>
      animal.activities.some(
        (activity) =>
          activity.category === "behavior" &&
          (activity.type === "dog_reactive" ||
            activity.type === "human_reactive"),
      ),
    ),
    notWalkedToday: animals.filter(
      (animal) => !todaysWalks.some((walk) => walk.animalId === animal.id),
    ),
  };

  // Prepare behavioral data
  const behavioralData = {
    goodBehavior: animals.filter((animal) =>
      animal.activities.some(
        (activity) =>
          activity.category === "behavior" &&
          activity.type.startsWith("good_") &&
          activity.severity === "info",
      ),
    ),
    purpleToYellow: animals.filter(
      (animal) =>
        animal.difficultyLevel === "Purple" &&
        animal.activities.some(
          (activity) =>
            activity.category === "behavior" &&
            activity.severity !== "critical" &&
            activity.severity !== "high",
        ),
    ),
    redFlags: animals.filter((animal) => animal.difficultyLevel === "Red"),
  };

  // Prepare medical data
  const medicalIssues = animals.filter((animal) =>
    animal.notes.some((note) => {
      if (!note.createdAt) return false;
      return (
        note.type === "medical" &&
        note.isActive &&
        note.createdAt.getTime() >= weekStartDate.getTime()
      );
    }),
  );

  // Prepare adoption readiness data
  const adoptionReadiness = {
    needsWork: animals.filter((animal) =>
      animal.activities.some(
        (activity) =>
          activity.severity === "medium" || activity.type === "training",
      ),
    ),
    ready: animals.filter((animal) =>
      animal.activities.every(
        (activity) =>
          activity.severity !== "critical" && activity.severity !== "high",
      ),
    ),
  };

  // Prepare chart data
  const walksByDay = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, index);
    const dayStart = startOfDay(date);
    const dayWalks = weeksWalks.filter(
      (walk) => startOfDay(walk.startedAt).getTime() === dayStart.getTime(),
    );
    const formattedDate = dayStart.toISOString().split("T")[0];
    if (!formattedDate) throw new Error("Invalid date format");
    return {
      date: formattedDate,
      walks: dayWalks.length,
    };
  }).reverse();

  // Calculate activity stats
  const activityStats: Record<string, number> = {};
  for (const activity of activities) {
    activityStats[activity.category] =
      (activityStats[activity.category] ?? 0) + 1;
  }

  return (
    <ScrollToBottom>
      <div className="flex min-h-screen flex-col gap-8 p-8">
        <DashboardHeader />
        <DashboardStats walks={weeksWalks} activities={activities} />
        <div className="grid gap-8 md:grid-cols-2">
          <VolunteerNeeds data={volunteerNeeds} />
          <KennelStatus animals={animals} />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <BehavioralInsights data={behavioralData} />
          <MedicalIssues animals={medicalIssues} />
        </div>
        <AdoptionReadiness data={adoptionReadiness} />
        <DashboardCharts
          walksByDay={walksByDay}
          activityStats={activityStats}
          animals={animals as any}
          totalKennels={kennels.length}
        />
      </div>
    </ScrollToBottom>
  );
}
