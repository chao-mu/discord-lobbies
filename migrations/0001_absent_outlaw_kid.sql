CREATE TABLE IF NOT EXISTS "lobbies_embeds" (
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"discord_channel_id" text NOT NULL,
	"discord_message_id" text NOT NULL,
	"lobby_id" integer NOT NULL,
	CONSTRAINT "lobbies_embeds_lobby_id_discord_channel_id_discord_message_id_pk" PRIMARY KEY("lobby_id","discord_channel_id","discord_message_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobbies_embeds" ADD CONSTRAINT "lobbies_embeds_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "lobbies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
