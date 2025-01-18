CREATE TABLE "kennel_room" (
	"createdAt" timestamp with time zone DEFAULT now(),
	"createdByUserId" varchar NOT NULL,
	"gridX" integer DEFAULT 0 NOT NULL,
	"gridY" integer DEFAULT 0 NOT NULL,
	"id" varchar(48) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"shelterId" varchar NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
-- First add the columns as nullable
ALTER TABLE "animal_media" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "animal_media" ADD COLUMN "sizeBytes" integer;--> statement-breakpoint
ALTER TABLE "animal_media" ADD COLUMN "width" integer;--> statement-breakpoint

-- Update existing records with default values
UPDATE "animal_media" SET "height" = 1080, "width" = 1920, "sizeBytes" = 0 WHERE "height" IS NULL;--> statement-breakpoint

-- Now make the columns required
ALTER TABLE "animal_media" ALTER COLUMN "height" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "animal_media" ALTER COLUMN "sizeBytes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "animal_media" ALTER COLUMN "width" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "kennel" ADD COLUMN "roomId" varchar;--> statement-breakpoint
ALTER TABLE "kennel_room" ADD CONSTRAINT "kennel_room_createdByUserId_user_id_fk" FOREIGN KEY ("createdByUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennel_room" ADD CONSTRAINT "kennel_room_shelterId_shelter_id_fk" FOREIGN KEY ("shelterId") REFERENCES "public"."shelter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennel" ADD CONSTRAINT "kennel_roomId_kennel_room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."kennel_room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Insert a default room for each shelter that has kennels
INSERT INTO "kennel_room" ("id", "name", "shelterId", "createdByUserId")
SELECT DISTINCT
  'room_lq1234abcd5678efgh9012ijkl' as "id",
  'Default Room' as "name",
  "shelterId",
  (SELECT "createdByUserId" FROM "shelter" WHERE "shelter"."id" = "kennel"."shelterId" LIMIT 1) as "createdByUserId"
FROM "kennel"
LIMIT 1;--> statement-breakpoint

-- Update all existing kennels to use their shelter's default room
UPDATE "kennel"
SET "roomId" = 'room_lq1234abcd5678efgh9012ijkl'
WHERE "roomId" IS NULL;--> statement-breakpoint

-- Now make roomId required
ALTER TABLE "kennel" ALTER COLUMN "roomId" SET NOT NULL;