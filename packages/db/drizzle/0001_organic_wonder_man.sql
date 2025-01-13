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
ALTER TABLE "animal_media" ADD COLUMN "height" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "animal_media" ADD COLUMN "sizeBytes" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "animal_media" ADD COLUMN "width" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "kennel" ADD COLUMN "roomId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "kennel_room" ADD CONSTRAINT "kennel_room_createdByUserId_user_id_fk" FOREIGN KEY ("createdByUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennel_room" ADD CONSTRAINT "kennel_room_shelterId_shelter_id_fk" FOREIGN KEY ("shelterId") REFERENCES "public"."shelter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennel" ADD CONSTRAINT "kennel_roomId_kennel_room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."kennel_room"("id") ON DELETE cascade ON UPDATE no action;