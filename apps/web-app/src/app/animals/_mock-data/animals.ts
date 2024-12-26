import type { Animal } from "../types";

export const mockAnimals: Animal[] = [
  {
    difficultyLevel: "Yellow",
    id: "1",
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K1",
    media: [
      {
        metadata: {
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          uploadedById: "user1",
        },
        type: "image",
        url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
      },
      {
        metadata: {
          uploadedAt: new Date(Date.now() - 1000 * 60 * 30),
          uploadedById: "user2",
        },
        thumbnailUrl:
          "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
        type: "video",
        url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
      },
    ],
    name: "Max",
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.75),
        goodBehavior: true,
        id: "1",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "completed",
        walkDifficulty: 2,
      },
    ],
  },
  {
    difficultyLevel: "Purple",
    id: "2",
    isFido: true,
    isOutOfKennel: true,
    kennelId: "K2",
    media: [
      {
        metadata: {
          uploadedAt: new Date(Date.now() - 1000 * 60 * 30),
          uploadedById: "user3",
        },
        type: "image",
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      },
    ],
    name: "Luna",
    walks: [],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "High energy, needs experienced handler",
      },
    ],
    difficultyLevel: "Purple",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "High energy, needs experienced handler",
      },
    ],
    id: "3",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K3",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Charlie",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        aggressive: true,
        dogReactive: true,
        endedAt: new Date(Date.now() - 1000 * 60 * 20),
        humanReactive: true,
        id: "3",
        notes: "Reactive to other dogs, had to cut walk short",
        pee: 1,
        pullsHard: true,
        startedAt: new Date(Date.now() - 1000 * 60 * 30),
        status: "completed",
        walkDifficulty: 4,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Sweet and gentle, good with all handlers",
      },
    ],
    id: "4",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K4",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Bella",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.75),
        goodBehavior: true,
        id: "4",
        leashTrained: true,
        likesPets: true,
        notes: "Perfect walk! Very well behaved and gentle on leash.",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "completed",
        treats: true,
        walkDifficulty: 1,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Friendly and calm, good with all handlers",
      },
    ],
    id: "5",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K5",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Cooper",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    tags: ["first"],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Red",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "High energy, needs experienced handler",
      },
    ],
    id: "6",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K6",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Storm",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.75),
        id: "6",
        notes: "Worked on heel command, showing improvement",
        pee: 1,
        poop: 1,
        pullsHard: true,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: "completed",
        trained: true,
        walkDifficulty: 5,
      },
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.75),
        id: "6.1",
        notes: "Better leash manners today",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "completed",
        trained: true,
        walkDifficulty: 4,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Small but mighty, good with experienced handlers",
      },
    ],
    id: "7",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K7",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Pixie",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    tags: ["last"],
    walks: [],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Very intelligent, needs mental stimulation",
      },
    ],
    id: "8",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: true,
    isOutOfKennel: false,
    kennelId: "K8",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Einstein",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    tags: ["last"],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        goodBehavior: true,
        id: "8",
        leashTrained: true,
        notes: "Excellent walk, practiced advanced commands",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: "completed",
        trained: true,
        walkDifficulty: 3,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Sweet and social, watch breathing in heat",
      },
    ],
    id: "9",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K9",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Breathing issues in hot weather",
      },
    ],
    name: "Winston",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.75),
        goodBehavior: true,
        id: "9",
        notes: "Short but sweet walk, no breathing issues",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: "completed",
        walkDifficulty: 1,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Red",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "High energy, needs experienced handler",
      },
    ],
    id: "10",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K10",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Shadow",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
        id: "10",
        notes: "Energetic walk, worked on loose leash walking",
        pee: 1,
        poop: 1,
        pullsHard: true,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: "completed",
        trained: true,
        walkDifficulty: 4,
      },
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.75),
        id: "10.1",
        notes: "Better leash manners today",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "completed",
        trained: true,
        walkDifficulty: 3,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Sweet and gentle, good with all handlers",
      },
    ],
    id: "11",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K11",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Mochi",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Purple",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Strong but friendly, needs experienced handler",
      },
    ],
    id: "12",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: true,
    isOutOfKennel: false,
    kennelId: "K12",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Rocky",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
        id: "12",
        notes: "Good walk, working on heel command",
        pee: 1,
        poop: 1,
        pullsHard: true,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: "completed",
        trained: true,
        walkDifficulty: 4,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Friendly and energetic",
      },
    ],
    id: "13",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K13",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Waffles",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.75),
        goodBehavior: true,
        id: "13",
        notes: "Great walk and playtime",
        pee: 1,
        playedBall: true,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: "completed",
        walkDifficulty: 2,
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Purple",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Gentle giant, needs experienced handler due to size",
      },
    ],
    id: "14",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: true,
    kennelId: "K14",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    name: "Atlas",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    tags: ["last"],
    walks: [
      {
        id: "14",
        startedAt: new Date(),
        status: "in_progress",
      },
    ],
  },
  {
    behavioralNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    difficultyLevel: "Yellow",
    generalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Playful and friendly, watch breathing in heat",
      },
    ],
    id: "15",
    inKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    isFido: false,
    isOutOfKennel: false,
    kennelId: "K15",
    medicalNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "Monitor breathing in hot weather",
      },
    ],
    name: "Biscuit",
    outKennelNotes: [
      {
        createdAt: new Date(),
        isActive: true,
        notes: "",
      },
    ],
    walks: [
      {
        endedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.75),
        goodBehavior: true,
        id: "15",
        notes: "Nice morning walk, good energy",
        pee: 1,
        poop: 1,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: "completed",
        walkDifficulty: 1,
      },
    ],
  },
];
