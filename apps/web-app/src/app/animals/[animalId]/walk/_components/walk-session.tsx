"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/lib/utils";
import { Textarea } from "@acme/ui/textarea";

import type { Animal, WalkSession } from "../../../types";
import { DIFFICULTY_CONFIG } from "../../../difficulty-config";
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

type ActivityKey = keyof NonNullable<WalkSession["activities"]>;

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
      { icon: <BallIcon />, key: "playedBall", label: "Ball" },
      { icon: <FetchIcon />, key: "playedFetch", label: "Fetch" },
    ],
    title: "Activities",
    type: "basic",
  },
  {
    buttons: [
      { icon: <ReactiveIcon />, key: "dogReactive", label: "Dog Reactive" },
      { icon: <ReactiveIcon />, key: "humanReactive", label: "Human Reactive" },
    ],
    title: "Reactivity",
    type: "behavioral",
  },
  {
    buttons: [
      { icon: <DogsIcon />, key: "likesSniffing", label: "Likes Sniffing" },
      { icon: <PeopleIcon />, key: "likesPets", label: "Likes Pets" },
      {
        icon: <GoodBehaviorIcon />,
        key: "leashTrained",
        label: "Leash Trained",
      },
      { icon: <GoodBehaviorIcon />, key: "checksIn", label: "Checks In" },
      {
        icon: <GoodBehaviorIcon />,
        key: "easyOut",
        label: "Easy Out",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "easyIn",
        label: "Easy In",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "takesTreetsGently",
        label: "Gentle with Treats",
      },
      { icon: <GoodBehaviorIcon />, key: "knowsSit", label: "Knows Sit" },
      {
        icon: <GoodBehaviorIcon />,
        key: "knows123Treat",
        label: "1,2,3 Treat",
      },
      {
        icon: <GoodBehaviorIcon />,
        key: "calmInNewPlaces",
        label: "Calm Outside",
      },
    ],
    title: "Pawsitive",
    type: "behavioral",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "eatsEverything",
        label: "Eats Everything",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "pullsHard",
        label: "Pulls Hard",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "jumpy",
        label: "Jumpy",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "mouthy",
        label: "Mouthy",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "boltingTendency",
        label: "Bolting",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "resourceGuarding",
        label: "Guards Items",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "noTouches",
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
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "frequentUrination",
        label: "Frequent Urination",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "looseStool",
        label: "Loose Stool",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "bloodyStool",
        label: "Bloody Stool",
      },
    ],
    title: "Urinary & Digestive",
    type: "medical",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "scratching",
        label: "Scratching",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "hotSpots",
        label: "Hot Spots",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "shakingHead",
        label: "Shaking Head",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "eyeDischarge",
        label: "Eye Discharge",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "noseDischarge",
        label: "Nose Discharge",
      },
    ],
    title: "Skin & Head",
    type: "medical",
  },
  {
    buttons: [
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "coughing",
        label: "Coughing",
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        key: "sneezing",
        label: "Sneezing",
      },
    ],
    title: "Respiratory",
    type: "medical",
  },
];

const DIFFICULTY_SCORES = [1, 2, 3, 4, 5] as const;

interface WalkSessionProps {
  animal: Animal;
  initialData?: Partial<WalkSession>;
}

export function WalkSession({ animal, initialData }: WalkSessionProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [walkData, setWalkData] = useState<Partial<WalkSession>>({
    activities: {},
    completed: false,
    time: new Date().toISOString(),
    ...initialData,
  });

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
        setWalkData((previous) => ({
          ...previous,
          notes: previous.notes ? `${previous.notes}\n${notes}` : notes,
        }));
      },
    });

  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];

  const toggleActivity = (activity: ActivityKey) => {
    setWalkData((previous) => ({
      ...previous,
      activities: {
        ...previous.activities,
        [activity]: !previous.activities?.[activity],
      },
    }));
  };

  const renderSection = (section: ActivitySection) => {
    // Create pairs of buttons
    const buttonPairs: ActivityButton[][] = [];
    for (let index = 0; index < section.buttons.length; index += 2) {
      buttonPairs.push(section.buttons.slice(index, index + 2));
    }

    return (
      <div key={section.title} className="space-y-2">
        <h2 className="font-medium">{section.title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {section.buttons.map((button) => (
            <div key={button.key} className="flex flex-col items-center gap-1">
              <Button
                variant={
                  walkData.activities?.[button.key] ? "default" : "outline"
                }
                className="h-16 w-full sm:h-20"
                onClick={() => toggleActivity(button.key)}
              >
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  {button.icon}
                  <span className="hidden text-sm sm:inline">
                    {button.label}
                  </span>
                </div>
              </Button>
              <span className="text-[10px] text-muted-foreground sm:hidden">
                {button.label}
              </span>
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
                    {walkData.elapsedTime ?? "Walk finished"}
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
                <div className="rounded-full bg-secondary px-3 py-1 text-center text-sm font-medium">
                  {animal.kennelNumber}
                </div>
                <div
                  className="rounded-full px-3 py-1 text-center text-sm font-medium"
                  style={{
                    backgroundColor: difficultyConfig.color,
                    color: "white",
                  }}
                >
                  {difficultyConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex max-w-3xl flex-col gap-8 pb-24 pt-4">
        {/* Notes Section */}
        <div className="space-y-2">
          <Textarea
            className="w-full rounded-lg border p-4"
            rows={3}
            placeholder="Add any notes about the walk..."
            value={walkData.notes}
            onChange={(event) =>
              setWalkData((previous) => ({
                ...previous,
                notes: event.target.value,
              }))
            }
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
            {DIFFICULTY_SCORES.map((score) => (
              <Button
                key={score}
                variant={
                  walkData.walkDifficulty === score ? "default" : "outline"
                }
                className={cn(
                  "flex-1 text-lg font-semibold",
                  walkData.walkDifficulty === score &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                onClick={() =>
                  setWalkData((previous) => ({
                    ...previous,
                    walkDifficulty: score,
                  }))
                }
              >
                {score}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Rate how difficult this walk was (1 = Easy, 5 = Very Difficult)
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
            onClick={() => router.push("/animals")}
          >
            Submit Walk
          </Button>
        </div>
      </div>
    </>
  );
}
