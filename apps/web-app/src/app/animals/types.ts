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
  status: "completed" | "in_progress";
  duration?: number;
  notes?: string;
  startedAt: Date;
  endedAt?: Date;
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

export interface MediaMetadata {
  uploadedBy: {
    name: string;
    avatarUrl?: string;
  };
  uploadedAt: Date | string;
}

export interface BaseMedia {
  url: string;
  metadata?: MediaMetadata;
}

export interface ImageMedia extends BaseMedia {
  type: "image";
}

export interface VideoMedia extends BaseMedia {
  type: "video";
  thumbnailUrl?: string;
}

export type AnimalMedia = ImageMedia | VideoMedia;

export interface Animal {
  id: string;
  name: string;
  kennelId: string;
  difficultyLevel: "Yellow" | "Purple" | "Red";
  isOutOfKennel: boolean;
  isFido: boolean;
  medicalNotes?: string;
  behavioralNotes?: string;
  generalNotes?: string;
  inKennelNotes?: string;
  tags?: string[];
  imageUrl?: string;
  media?: AnimalMedia[];
  walks?: WalkSession[];
}
