"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useServerAction } from "zsa-react";

import type { ActivityTypeEnum, WalkTypeWithRelations } from "@acme/db/schema";
import { activityTypeEnum } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { Icons } from "@acme/ui/icons";
import { Label } from "@acme/ui/label";
import { cn } from "@acme/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Textarea } from "@acme/ui/textarea";

import { AnimalImages } from "~/components/animal-images";
import { NumberInput } from "~/components/number-input";
import { formatDuration } from "~/utils/date-time-helpers";
import { finishWalkAction } from "./actions";
import {
  BackIcon,
  BallIcon,
  FetchIcon,
  GoodBehaviorIcon,
  LimpingIcon,
  PeeIcon,
  ReactiveIcon,
} from "./icons";
import { useAudioRecorder } from "./use-audio-recorder";

type ActivityKey = ActivityTypeEnum;

interface ActivityButton {
  key?: ActivityKey;
  label: string;
  icon: React.ReactNode;
  children?: (ActivityButton | ActivitySubSection)[];
}

interface ActivitySection {
  title: string;
  buttons: ActivityButton[];
  type?: "basic" | "behavioral" | "medical";
}

interface ActivitySubSection {
  label: string;
  items: {
    key: ActivityKey;
    label: string;
    icon: React.ReactNode;
  }[];
  isSubSection: true;
}

const ACTIVITY_SECTIONS: ActivitySection[] = [
  {
    buttons: [
      {
        children: [
          {
            icon: <AlertTriangle className="size-4" />,
            key: "frequent_urination",
            label: "Frequent Urination",
          },
        ],
        icon: <PeeIcon />,
        key: "pee",
        label: "Peed",
      },
      {
        children: [
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
          {
            icon: <AlertTriangle className="size-4" />,
            key: "diarrhea",
            label: "Diarrhea",
          },
        ],
        icon: <PeeIcon />,
        key: "poop",
        label: "Pooped",
      },
      {
        children: [
          { icon: <BallIcon />, key: "played_ball", label: "Ball" },
          { icon: <FetchIcon />, key: "played_fetch", label: "Fetch" },
          { icon: <BallIcon />, key: "played_tug", label: "Tug" },
        ],
        icon: <BallIcon />,
        key: "play_activities" as any,
        label: "Play Activities",
      },
    ],
    title: "Quick Actions",
    type: "basic",
  },
  {
    buttons: [
      {
        children: [
          {
            isSubSection: true,
            items: [
              {
                icon: <ReactiveIcon />,
                key: "dog_reactive",
                label: "Dog Reactive",
              },
              {
                icon: <ReactiveIcon />,
                key: "human_reactive",
                label: "Human Reactive",
              },
              {
                icon: <ReactiveIcon />,
                key: "aggressive",
                label: "Aggressive",
              },
            ],
            label: "Types of Reactivity",
          },
        ],
        icon: <ReactiveIcon />,
        key: "dog_reactive",
        label: "Reactivity",
      },
      {
        children: [
          {
            isSubSection: true,
            items: [
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
            label: "Common Issues",
          },
        ],
        icon: <AlertTriangle className="size-4" />,
        key: "pulls_hard",
        label: "Behavior Issues",
      },
      {
        children: [
          {
            isSubSection: true,
            items: [
              {
                icon: <GoodBehaviorIcon />,
                key: "leash_trained",
                label: "Leash Trained",
              },
              {
                icon: <GoodBehaviorIcon />,
                key: "checks_in",
                label: "Checks In",
              },
              {
                icon: <GoodBehaviorIcon />,
                key: "calm_in_new_places",
                label: "Calm Outside",
              },
            ],
            label: "Leash Skills",
          },
          {
            isSubSection: true,
            items: [
              {
                icon: <GoodBehaviorIcon />,
                key: "knows_sit",
                label: "Knows Sit",
              },
              {
                icon: <GoodBehaviorIcon />,
                key: "knows_123_treat",
                label: "1,2,3 Treat",
              },
            ],
            label: "Commands & Training",
          },
          {
            isSubSection: true,
            items: [
              {
                icon: <GoodBehaviorIcon />,
                key: "easy_out",
                label: "Easy Out",
              },
              { icon: <GoodBehaviorIcon />, key: "easy_in", label: "Easy In" },
              {
                icon: <GoodBehaviorIcon />,
                key: "takes_treats_gently",
                label: "Gentle with Treats",
              },
            ],
            label: "Manners",
          },
        ],
        icon: <GoodBehaviorIcon />,
        key: "leash_trained",
        label: "Good Behaviors",
      },
    ],
    title: "Behavior",
    type: "behavioral",
  },
  {
    buttons: [
      {
        children: [
          {
            isSubSection: true,
            items: [
              { icon: <LimpingIcon />, key: "limping", label: "Limping" },
            ],
            label: "Physical Movement",
          },
        ],
        icon: <LimpingIcon />,
        key: "limping",
        label: "Movement Issues",
      },
      {
        children: [
          {
            isSubSection: true,
            items: [
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
            ],
            label: "Skin Concerns",
          },
        ],
        icon: <AlertTriangle className="size-4" />,
        key: "scratching",
        label: "Skin & Coat Issues",
      },
      {
        children: [
          {
            isSubSection: true,
            items: [
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
            label: "Head Concerns",
          },
        ],
        icon: <AlertTriangle className="size-4" />,
        key: "shaking_head",
        label: "Head & Face Issues",
      },
      {
        children: [
          {
            isSubSection: true,
            items: [
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
            label: "Breathing Concerns",
          },
        ],
        icon: <AlertTriangle className="size-4" />,
        key: "coughing",
        label: "Respiratory Issues",
      },
    ],
    title: "Health Concerns",
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
    walk.walkDifficultyLevel > 0 ? walk.walkDifficultyLevel : 3,
  );
  const [startedAt, setStartedAt] = useState<Date>(walk.startedAt);
  const [endedAt, setEndedAt] = useState<Date>(walk.endedAt ?? new Date());
  const [noteText, setNoteText] = useState<string>("");
  const [expandedActivities, setExpandedActivities] = useState<
    Set<ActivityKey>
  >(new Set());

  useEffect(() => {
    const notes = walk.notes.map((note) => note.notes);
    setNoteText(notes.join("\n"));
  }, [walk.notes]);

  const formattedDuration = useMemo(() => {
    const durationInMinutes = Math.floor(
      (endedAt.getTime() - startedAt.getTime()) / (1000 * 60),
    );
    return formatDuration(durationInMinutes);
  }, [startedAt, endedAt]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { recordingStatus } = useAudioRecorder({
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

  const toggleExpanded = (activity: ActivityKey) => {
    setExpandedActivities((previous) => {
      const next = new Set(previous);
      if (next.has(activity)) {
        next.delete(activity);
      } else {
        next.add(activity);
      }
      return next;
    });
  };

  const renderActivityButton = (button: ActivityButton, _depth = 0) => {
    const isExpanded = button.key ? expandedActivities.has(button.key) : false;
    const hasChildren = button.children && button.children.length > 0;
    const isParentCategory =
      hasChildren && button.key !== "pee" && button.key !== "poop";

    const isQuickAction = !isParentCategory && hasChildren;

    const showQuickActionContent =
      isQuickAction && button.key ? activities[button.key] : false;

    return (
      <div
        key={button.key ?? button.label}
        className="flex w-full flex-col gap-2"
      >
        <Button
          variant={
            isParentCategory
              ? "outline"
              : button.key && activities[button.key]
                ? "default"
                : "outline"
          }
          className={cn(
            "relative h-16 w-full sm:h-20",
            !isParentCategory &&
              button.key &&
              activities[button.key] &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            isParentCategory && "justify-between bg-muted/50 hover:bg-muted",
          )}
          onClick={() => {
            if (!isParentCategory && button.key) {
              toggleActivity(button.key);
            }
            if (hasChildren && !isQuickAction && button.key) {
              toggleExpanded(button.key);
            }
          }}
        >
          <div className="flex items-center gap-2">
            {button.icon}
            <span className="text-sm">{button.label}</span>
          </div>
          {hasChildren && !isQuickAction && (
            <Icons.ChevronDown
              className={cn(
                "size-4 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          )}
        </Button>

        {hasChildren &&
          button.children &&
          (isExpanded || showQuickActionContent) && (
            <div
              className={cn(
                "grid gap-2 rounded-lg",
                "grid-cols-1 bg-muted/30 p-4",
              )}
            >
              {button.children.map((child) => {
                if ("isSubSection" in child && child.isSubSection) {
                  return (
                    <div key={child.label} className="space-y-2">
                      <div className="flex h-8 items-center px-2 text-xs font-medium text-muted-foreground">
                        {child.label}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {child.items.map((item) => (
                          <Button
                            key={item.key}
                            variant={
                              activities[item.key] ? "default" : "outline"
                            }
                            className={cn(
                              "h-16 w-full sm:h-20",
                              activities[item.key] &&
                                "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                            onClick={() => toggleActivity(item.key)}
                          >
                            <div className="flex flex-col items-center gap-2 sm:flex-row">
                              {item.icon}
                              <span className="text-sm">{item.label}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return renderActivityButton(child as ActivityButton);
              })}
            </div>
          )}
      </div>
    );
  };

  const renderSection = (section: ActivitySection) => {
    return (
      <div key={section.title} className="space-y-4">
        <h2 className="text-lg font-medium text-muted-foreground">
          {section.title}
        </h2>
        <div
          className={cn(
            "grid gap-4",
            section.type === "basic"
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1",
          )}
        >
          {section.buttons.map((button) => renderActivityButton(button))}
        </div>
      </div>
    );
  };

  const handleSubmitWalk = async () => {
    try {
      const [result] = await finishWalkServerAction.execute({
        activities,
        endedAt,
        notes: noteText || undefined,
        shelterId: walk.animal.shelterId,
        startedAt,
        walkDifficultyLevel,
        walkId: walk.id,
      });

      if (result?.success) {
        router.push(
          `/shelters/${walk.animal.shelterId}/rooms/${walk.animal.kennelOccupants[0]?.kennel.roomId}/kennels`,
        );
      }
    } catch (error: unknown) {
      console.error("Failed to submit walk:", error);
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Walk Photos</h2>
          </div>
          <AnimalImages
            animalId={animal.id}
            shelterId={animal.shelterId}
            name={animal.name}
            roomId={animal.kennelOccupants[0]?.kennel.roomId ?? ""}
            walkId={walk.id}
            kennelId={animal.kennelOccupants[0]?.kennelId ?? ""}
            media={walk.media}
          />
        </div>

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
            {/* <Button
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
            </Button> */}
            {recordingStatus && (
              <span className="text-sm text-muted-foreground">
                {recordingStatus}
              </span>
            )}
          </div>
        </div>

        {/* Walk Date/Time Controls */}
        {walk.status !== "completed" && (
          <div className="space-y-4">
            <h2 className="font-medium">Walk Date & Time</h2>
            <div className="flex flex-col gap-4">
              <Label htmlFor="startedAt">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Icons.Calendar className="mr-2 size-4" />
                    <span>{startedAt.toLocaleDateString()}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startedAt}
                    onSelect={(date) => {
                      if (date) {
                        const duration =
                          endedAt.getTime() - startedAt.getTime();
                        setStartedAt(date);
                        setEndedAt(new Date(date.getTime() + duration));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <NumberInput
                id="startedAt"
                name="startedAt"
                type="number"
                placeholder="Walk Duration (minutes)"
                quickFillValues={[15, 20, 25, 30]}
                defaultValue={Math.floor(
                  (endedAt.getTime() - startedAt.getTime()) / (1000 * 60),
                )}
                onChange={(event) => {
                  setEndedAt(new Date(startedAt.getTime() + event * 60 * 1000));
                }}
              />
            </div>
          </div>
        )}

        {/* Walk Difficulty Score */}
        <div className="space-y-2">
          <h2 className="font-medium">Walk Difficulty Score</h2>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <div key={score} className="flex flex-col items-center gap-1">
                <Button
                  variant={
                    walkDifficultyLevel === score ? "default" : "outline"
                  }
                  className={cn(
                    "grid h-12 w-full place-content-center text-lg font-semibold",
                    walkDifficultyLevel === score &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                  onClick={() => setWalkDifficultyLevel(score)}
                >
                  {score}
                </Button>
                {score === 1 && (
                  <span className="text-xs text-muted-foreground">Easy</span>
                )}
                {score === 5 && (
                  <span className="text-xs text-muted-foreground">
                    Very Difficult
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Sections */}
        <div className="space-y-8">
          {/* Basic Activities */}
          <div className="space-y-6">
            {ACTIVITY_SECTIONS.filter(
              (section) => section.type === "basic",
            ).map((section) => renderSection(section))}
          </div>

          {/* Behavioral Observations */}
          {ACTIVITY_SECTIONS.filter(
            (section) => section.type === "behavioral",
          ).map((section) => renderSection(section))}

          {/* Medical Observations */}
          {ACTIVITY_SECTIONS.filter(
            (section) => section.type === "medical",
          ).map((section) => renderSection(section))}
        </div>
      </div>

      {/* Sticky Submit Walk Button */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background p-4 shadow-lg">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
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
