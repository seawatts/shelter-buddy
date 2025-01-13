"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistance } from "date-fns";
import { AlertTriangle } from "lucide-react";

import type { ActivityTypeEnum, WalkTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import { AnimalImages } from "~/components/animal-images";
import { formatDuration } from "~/utils/date-time-helpers";
import {
  BackIcon,
  BallIcon,
  DogsIcon,
  FetchIcon,
  GoodBehaviorIcon,
  LimpingIcon,
  PeeIcon,
  PeopleIcon,
  ReactiveIcon,
} from "./icons";

type ActivityKey = ActivityTypeEnum;

interface ActivityButton {
  key: ActivityKey;
  label: string;
  icon: React.ReactNode;
}

interface ActivitySection {
  title: string;
  buttons: ActivityButton[];
  type?: "basic" | "behavioral" | "medical";
}

const ACTIVITY_SECTIONS: ActivitySection[] = [
  {
    buttons: [
      { icon: <PeeIcon />, key: "pee", label: "Peed" },
      { icon: <PeeIcon />, key: "poop", label: "Pooped" },
    ],
    title: "Bathroom Breaks",
    type: "basic",
  },
  {
    buttons: [
      { icon: <BallIcon />, key: "played_ball", label: "Ball" },
      { icon: <FetchIcon />, key: "played_fetch", label: "Fetch" },
    ],
    title: "Activities",
    type: "basic",
  },
  {
    buttons: [
      { icon: <ReactiveIcon />, key: "dog_reactive", label: "Dog Reactive" },
      {
        icon: <ReactiveIcon />,
        key: "human_reactive",
        label: "Human Reactive",
      },
    ],
    title: "Reactivity",
    type: "behavioral",
  },
  {
    buttons: [
      { icon: <DogsIcon />, key: "likes_sniffing", label: "Likes Sniffing" },
      { icon: <PeopleIcon />, key: "likes_pets", label: "Likes Pets" },
      {
        icon: <GoodBehaviorIcon />,
        key: "leash_trained",
        label: "Leash Trained",
      },
      { icon: <GoodBehaviorIcon />, key: "checks_in", label: "Checks In" },
      {
        icon: <GoodBehaviorIcon />,
        key: "easy_out",
        label: "Easy Out",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "easy_in",
        label: "Easy In",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "takes_treats_gently",
        label: "Gentle with Treats",
      },
      { icon: <GoodBehaviorIcon />, key: "knows_sit", label: "Knows Sit" },
      {
        icon: <GoodBehaviorIcon />,
        key: "knows_123_treat",
        label: "1,2,3 Treat",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "calm_in_new_places",
        label: "Calm Outside",
      },
    ],
    title: "Pawsitive",
    type: "behavioral",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="size-4" />,
        key: "eats_everything",
        label: "Eats Everything",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "pulls_hard",
        label: "Pulls Hard",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "jumpy",
        label: "Jumpy",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "mouthy",
        label: "Mouthy",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "bolting_tendency",
        label: "Bolting",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "resource_guarding",
        label: "Guards Items",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "no_touches",
        label: "No Touches",
      },
    ],
    title: "Safety",
    type: "behavioral",
  },
  {
    buttons: [{ icon: <LimpingIcon />, key: "limping", label: "Limping" }],
    title: "Movement",
    type: "medical",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="size-4" />,
        key: "frequent_urination",
        label: "Frequent Urination",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "loose_stool",
        label: "Loose Stool",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "bloody_stool",
        label: "Bloody Stool",
      },
    ],
    title: "Urinary & Digestive",
    type: "medical",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="size-4" />,
        key: "scratching",
        label: "Scratching",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "hot_spots",
        label: "Hot Spots",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "shaking_head",
        label: "Shaking Head",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "eye_discharge",
        label: "Eye Discharge",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "nose_discharge",
        label: "Nose Discharge",
      },
    ],
    title: "Skin & Head",
    type: "medical",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="size-4" />,
        key: "coughing",
        label: "Coughing",
      },
      {
        icon: <AlertTriangle className="size-4" />,
        key: "sneezing",
        label: "Sneezing",
      },
    ],
    title: "Respiratory",
    type: "medical",
  },
];

interface WalkSessionReadOnlyProps {
  walk: WalkTypeWithRelations & {
    activities: { type: ActivityTypeEnum }[];
  };
}

export function WalkSessionReadOnly({ walk }: WalkSessionReadOnlyProps) {
  const { animal } = walk;
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const formattedDuration = useMemo(() => {
    if (!walk.endedAt) return "In Progress";
    const durationInMinutes = Math.floor(
      (walk.endedAt.getTime() - walk.startedAt.getTime()) / (1000 * 60),
    );
    return formatDuration(durationInMinutes);
  }, [walk.startedAt, walk.endedAt]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderSection = (section: ActivitySection) => {
    return (
      <div key={section.title} className="space-y-2">
        <h2 className="font-medium">{section.title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {section.buttons.map((button) => {
            const isActive = walk.activities.some(
              (activity) => activity.type === button.key,
            );

            return (
              <div
                key={button.key}
                className="flex flex-col items-center gap-1"
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  className="pointer-events-none h-16 w-full sm:h-20"
                >
                  <div className="flex flex-col items-center gap-2 sm:flex-row">
                    {button.icon}
                    <span className="text-sm">{button.label}</span>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSectionGroup = (title: string, sections: ActivitySection[]) => (
    <div className="space-y-6">
      <div className="sticky top-[56px] -mx-4 bg-background px-4 py-2 shadow-sm">
        <h2 className="text-lg font-semibold text-muted-foreground">{title}</h2>
      </div>
      <div className="space-y-6">
        {sections.map((section) => renderSection(section))}
      </div>
    </div>
  );

  const basicSections = ACTIVITY_SECTIONS.filter(
    (section) => section.type === "basic",
  );
  const behavioralSections = ACTIVITY_SECTIONS.filter(
    (section) => section.type === "behavioral",
  );
  const medicalSections = ACTIVITY_SECTIONS.filter(
    (section) => section.type === "medical",
  );

  return (
    <>
      {/* Sticky Header */}
      <div
        className={cn(
          "sticky top-0 z-10 border-b bg-background transition-all duration-200",
          isScrolled ? "h-14" : "h-24 sm:h-24",
        )}
      >
        <div className="container h-full max-w-3xl">
          <div className="flex h-full items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <BackIcon />
            </Button>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1
                  className={cn(
                    "font-bold transition-all duration-200",
                    isScrolled ? "text-2xl" : "text-3xl",
                  )}
                >
                  {animal.name}
                </h1>
              </div>
              <div
                className={cn(
                  "flex gap-2",
                  isScrolled
                    ? "flex-row items-center"
                    : "flex-col sm:flex-row sm:items-center",
                )}
              >
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar className="size-4" />
                    <span>
                      {walk.endedAt
                        ? formatDistance(new Date(), walk.endedAt, {
                            addSuffix: true,
                          })
                        : "In Progress"}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icons.Clock className="size-4" />
                    {formattedDuration}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex max-w-3xl flex-col gap-8 pb-24 pt-4">
        {/* Animal Images Section */}
        <AnimalImages
          animalId={animal.id}
          shelterId={animal.shelterId}
          name={animal.name}
          media={animal.media}
        />

        {/* Notes Section */}
        {walk.notes.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-medium">Notes</h2>
            <div className="rounded-lg border p-4">
              {walk.notes.map((note) => (
                <p key={note.id}>{note.notes}</p>
              ))}
            </div>
          </div>
        )}

        {/* Walk Difficulty Score */}
        <div className="space-y-2">
          <h2 className="font-medium">Walk Difficulty Score</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <Button
                key={score}
                variant={
                  walk.walkDifficultyLevel === score ? "default" : "outline"
                }
                className={cn(
                  "pointer-events-none flex-1 text-lg font-semibold",
                  walk.walkDifficultyLevel === score &&
                    "bg-primary text-primary-foreground",
                )}
              >
                {score}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            (1 = Easy, 5 = Very Difficult)
          </p>
        </div>

        {/* Activity Sections */}
        <div className="space-y-8">
          {/* Basic Activities */}
          <div className="space-y-6">
            {basicSections.map((section) => renderSection(section))}
          </div>

          {/* Behavioral Observations */}
          {renderSectionGroup("Behavioral Observations", behavioralSections)}

          {/* Medical Observations */}
          {renderSectionGroup("Medical Observations", medicalSections)}
        </div>
      </div>
    </>
  );
}
