export type KennelSize = "small" | "medium" | "large";
export type KennelType = "standard" | "isolation" | "senior" | "quiet";
export type KennelStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "reserved";
export type MaintenanceStatus = "good" | "needs-repair" | "under-maintenance";
export type KennelFeatures =
  | "dog-door"
  | "dog-run"
  | "dog-roof"
  | "dog-window"
  | "heated"
  | "sound-dampening"
  | "reinforced"
  | "covered"
  | "sound-proof"
  | "extra-padding"
  | "extra-space";

export interface Kennel {
  id: string;
  name: string;
  status: KennelStatus;
  type: KennelType;
  size: KennelSize;
  location: string;
  features: KennelFeatures[];
  notes: string;
  lastCleanedAt: Date;
  currentOccupantId?: string | null;
  maintenanceStatus?: MaintenanceStatus;
  maintenanceNotes?: {
    notes: string;
    createdAt: Date;
  }[];
}

export type DifficultyLevel = "Yellow" | "Purple" | "Red";

export interface WalkSession {
  id: string;
  status: "completed" | "in_progress" | "not_started";
  notes?: string;
  startedAt: Date;
  endedAt?: Date;
  walkDifficulty?: 1 | 2 | 3 | 4 | 5;
  // Bathroom activities
  poop?: number;
  pee?: number;
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
  walkedById?: string;
}

export interface MediaMetadata {
  uploadedById: string;
  uploadedAt: Date;
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
  difficultyLevel: DifficultyLevel;
  isOutOfKennel: boolean;
  isFido: boolean;
  age?: number;
  breed?: string;
  weight?: number;
  approvedActivities?: string[];
  medicalNotes?: {
    notes: string;
    createdAt: Date;
    isActive: boolean;
  }[];
  behavioralNotes?: {
    notes: string;
    createdAt: Date;
    isActive: boolean;
  }[];
  generalNotes?: {
    notes: string;
    createdAt: Date;
    isActive: boolean;
  }[];
  inKennelNotes?: {
    notes: string;
    createdAt: Date;
    isActive: boolean;
  }[];
  outKennelNotes?: {
    notes: string;
    createdAt: Date;
    isActive: boolean;
  }[];
  tags?: string[];
  avatarUrl?: string;
  media?: AnimalMedia[];
  walks?: WalkSession[];
}
