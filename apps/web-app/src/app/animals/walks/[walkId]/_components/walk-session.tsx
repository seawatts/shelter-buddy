"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useServerAction } from "zsa-react";

import type { ActivityTypeEnum, WalkTypeWithRelations } from "@acme/db/schema";
import { activityTypeEnum } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";
import { Textarea } from "@acme/ui/textarea";

import { formatDuration } from "../../../_components/kennel-grid/utils";
import { finishWalkAction } from "./actions";
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
  StartRecordingIcon,
  StopRecordingIcon,
} from "./icons";
import { useAudioRecorder } from "./use-audio-recorder";

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

interface WalkSessionProps {
  walk: WalkTypeWithRelations;
}

export function WalkSession({ walk }: WalkSessionProps) {
  const router = useRouter();
  const { animal } = walk;
  const finishWalkServerAction = useServerAction(finishWalkAction);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activities, setActivities] = useState<
    Record<ActivityTypeEnum, boolean>
  >(() => {
    const initialActivities = {} as Record<ActivityTypeEnum, boolean>;
    for (const activity of activityTypeEnum.enumValues) {
      initialActivities[activity] = false;
    }
    return initialActivities;
  });
  const [walkDifficultyLevel, setWalkDifficultyLevel] = useState<number>(
    walk.walkDifficultyLevel > 0 ? walk.walkDifficultyLevel : 1,
  );
  const [noteText, setNoteText] = useState<string>("");

  useEffect(() => {
    const notes = walk.notes.map((note) => note.notes);
    setNoteText(notes.join("\n"));
  }, [walk.notes]);

  const formattedDuration = useMemo(() => {
    const endTime = walk.endedAt ?? new Date();
    const durationInMinutes = Math.floor(
      (endTime.getTime() - walk.startedAt.getTime()) / (1000 * 60),
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

  const { isRecording, recordingStatus, startRecording, stopRecording } =
    useAudioRecorder({
      onTranscriptionComplete: (notes) => {
        setNoteText(notes);
      },
    });

  const toggleActivity = (activity: ActivityKey) => {
    setActivities((previous) => ({
      ...previous,
      [activity]: !previous[activity],
    }));
  };

  const renderSection = (section: ActivitySection) => {
    return (
      <div key={section.title} className="space-y-2">
        <h2 className="font-medium">{section.title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {section.buttons.map((button) => (
            <div key={button.key} className="flex flex-col items-center gap-1">
              <Button
                variant={activities[button.key] ? "default" : "outline"}
                className="h-16 w-full sm:h-20"
                onClick={() => toggleActivity(button.key)}
              >
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  {button.icon}
                  <span className="text-sm">{button.label}</span>
                </div>
              </Button>
            </div>
          ))}
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

  const handleSubmitWalk = async () => {
    try {
      const [data, error] = await finishWalkServerAction.execute({
        activities,
        notes: noteText || undefined,
        walkDifficultyLevel,
        walkId: walk.id,
      });

      if (data?.success) {
        router.push("/animals");
      } else if (error) {
        console.error("Failed to submit walk:", error.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to submit walk:", error.message);
      } else {
        console.error("Failed to submit walk:", error);
      }
    }
  };

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
            <Link
              href={`/animals/${animal.id}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <BackIcon />
            </Link>
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
                {!isScrolled && (
                  <p className="text-sm text-muted-foreground">
                    {formattedDuration}
                  </p>
                )}
              </div>
              <div
                className={cn(
                  "flex gap-2",
                  isScrolled
                    ? "flex-row items-center"
                    : "flex-col sm:flex-row sm:items-center",
                )}
              >
                Return to kennel
                <div className="rounded-full bg-secondary px-3 py-1 text-center text-sm font-medium">
                  {animal.kennelOccupants[0]?.kennel.name}
                </div>
                {/* <div
                  className="rounded-full px-3 py-1 text-center text-sm font-medium text-white"
                  style={{
                    backgroundColor:
                      difficultyConfig.color ?? "hsl(var(--primary))",
                  }}
                >
                  {difficultyConfig.label ?? animal.difficultyLevel}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex max-w-3xl flex-col gap-8 pb-24 pt-4">
        {/* Walk Photos Section */}
        {/* <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Walk Photos</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="size-4" />
              <span>Add Photo</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {walkData.media?.length === 0 ? (
              <div className="col-span-full flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
                No photos added yet
              </div>
            ) : (
              walkData.media?.map((media, index) => (
                <div
                  key={media.id}
                  className="relative aspect-square overflow-hidden rounded-md border"
                >
                  <Image
                    src={media.url}
                    alt={`Walk photo ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
              ))
            )}
          </div>
        </div> */}

        {/* Notes Section */}
        <div className="space-y-2">
          <Textarea
            className="w-full rounded-lg border p-4"
            rows={3}
            placeholder="Add any notes about the walk..."
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className="w-full gap-2 sm:w-auto"
              size="lg"
            >
              {isRecording ? (
                <>
                  <StopRecordingIcon />
                  <span className="hidden sm:inline">Stop Recording</span>
                  <span className="sm:hidden">Stop</span>
                </>
              ) : (
                <>
                  <StartRecordingIcon />
                  <span className="hidden sm:inline">Record Notes</span>
                  <span className="sm:hidden">Record</span>
                </>
              )}
            </Button>
            {recordingStatus && (
              <span className="text-sm text-muted-foreground">
                {recordingStatus}
              </span>
            )}
          </div>
        </div>

        {/* Walk Difficulty Score */}
        <div className="space-y-2">
          <h2 className="font-medium">Walk Difficulty Score</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <Button
                key={score}
                variant={walkDifficultyLevel === score ? "default" : "outline"}
                className={cn(
                  "flex-1 text-lg font-semibold",
                  walkDifficultyLevel === score &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                onClick={() => setWalkDifficultyLevel(score)}
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

      {/* Sticky Submit Walk Button */}
      <div className="fixed bottom-0 left-0 w-full border-t bg-background p-4">
        <div className="container max-w-3xl">
          <Button
            variant="default"
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleSubmitWalk}
            disabled={finishWalkServerAction.isPending}
          >
            {finishWalkServerAction.isPending ? (
              <>
                <Icons.Spinner className="mr-2" />
                Submitting Walk...
              </>
            ) : (
              "Submit Walk"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
