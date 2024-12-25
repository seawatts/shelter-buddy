export interface WalkSession {
  completed: boolean;
  duration?: number;
  notes?: string;
  time: string;
  elapsedTime?: string;
  walkDifficulty?: 1 | 2 | 3 | 4 | 5;
  activities?: {
    // Bathroom activities
    poop?: boolean;
    pee?: boolean;
    accident?: boolean; // Accident during walk

    // Play activities
    playedBall?: boolean;
    playedTug?: boolean;
    playedFetch?: boolean;

    // Training/Behavior
    trained?: boolean;
    treats?: boolean;

    // Incidents
    pulled?: boolean;
    dogReactive?: boolean;
    humanReactive?: boolean;
    aggressive?: boolean;
    bite?: boolean;

    // Safety Concerns
    pullsHard?: boolean;
    jumpy?: boolean;
    mouthy?: boolean;
    boltingTendency?: boolean;
    resourceGuarding?: boolean;
    eatsEverything?: boolean;
    noTouches?: boolean;

    // Health/Wellness
    vomit?: boolean;
    diarrhea?: boolean;
    limping?: boolean;
    frequentUrination?: boolean;
    looseStool?: boolean;
    bloodyStool?: boolean;
    scratching?: boolean;
    shakingHead?: boolean;
    coughing?: boolean;
    sneezing?: boolean;
    eyeDischarge?: boolean;
    noseDischarge?: boolean;
    hotSpots?: boolean;

    // Social/Positive Behaviors
    likesSniffing?: boolean;
    likesPets?: boolean;
    goodBehavior?: boolean;
    leashTrained?: boolean;
    checksIn?: boolean;
    easyOut?: boolean;
    easyIn?: boolean;
    playsBow?: boolean;
    sharesToys?: boolean;
    takesTreetsGently?: boolean;
    knowsSit?: boolean;
    knows123Treat?: boolean;
    knowsStay?: boolean;
    knowsLeave?: boolean;
    knowsWait?: boolean;
    knowsCome?: boolean;
    focusedOnHandler?: boolean;
    calmInNewPlaces?: boolean;
  };
  walkedBy?: {
    id: string;
    name: string;
  };
}
export type KennelSize = "small" | "medium" | "large";
export type KennelType = "standard" | "isolation" | "senior" | "quiet";
export type KennelStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "reserved";
export type MaintenanceStatus = "good" | "needs-repair" | "under-maintenance";

export interface Kennel {
  id: string;
  name: string;
  status: KennelStatus;
  type: KennelType;
  size: KennelSize;
  location: string;
  features: string[];
  notes: string;
  lastCleaned: string;
  currentOccupantId: string | null;
  maintenanceStatus: MaintenanceStatus;
  maintenanceNotes?: string;
}

export type DifficultyLevel = "Yellow" | "Purple" | "Red";

export interface WalkSession {
  completed: boolean;
  duration?: number;
  notes?: string;
  time: string;
  elapsedTime?: string;
  walkDifficulty?: 1 | 2 | 3 | 4 | 5;
  activities?: {
    // Bathroom activities
    poop?: boolean;
    pee?: boolean;
    accident?: boolean;

    // Play activities
    playedBall?: boolean;
    playedTug?: boolean;
    playedFetch?: boolean;

    // Training/Behavior
    trained?: boolean;
    treats?: boolean;

    // Incidents
    pulled?: boolean;
    dogReactive?: boolean;
    humanReactive?: boolean;
    aggressive?: boolean;
    bite?: boolean;

    // Safety Concerns
    pullsHard?: boolean;
    jumpy?: boolean;
    mouthy?: boolean;
    boltingTendency?: boolean;
    resourceGuarding?: boolean;
    eatsEverything?: boolean;
    noTouches?: boolean;

    // Health/Wellness
    vomit?: boolean;
    diarrhea?: boolean;
    limping?: boolean;
    frequentUrination?: boolean;
    looseStool?: boolean;
    bloodyStool?: boolean;
    scratching?: boolean;
    shakingHead?: boolean;
    coughing?: boolean;
    sneezing?: boolean;
    eyeDischarge?: boolean;
    noseDischarge?: boolean;
    hotSpots?: boolean;

    // Social/Positive Behaviors
    likesSniffing?: boolean;
    likesPets?: boolean;
    goodBehavior?: boolean;
    leashTrained?: boolean;
    checksIn?: boolean;
    easyOut?: boolean;
    easyIn?: boolean;
    playsBow?: boolean;
    sharesToys?: boolean;
    takesTreetsGently?: boolean;
    knowsSit?: boolean;
    knows123Treat?: boolean;
    knowsStay?: boolean;
    knowsLeave?: boolean;
    knowsWait?: boolean;
    knowsCome?: boolean;
    focusedOnHandler?: boolean;
    calmInNewPlaces?: boolean;
  };
  walkedBy?: {
    id: string;
    name: string;
  };
}

export interface Animal {
  id: string;
  kennelNumber: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  notes: string;
  medicalNotes?: string;
  behavioralNotes?: string;
  difficultyLevel: DifficultyLevel;
  assignedVolunteer?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  walks: Record<string, WalkSession>;
  isFido: boolean;
  isOutOfKennel: boolean;
  availableDate: string;
  approvedActivities: string[];
  generalNotes?: string;
  inKennelNotes?: string;
  outKennelNotes?: string;
  kennel: string;
  tags?: string[];
}
