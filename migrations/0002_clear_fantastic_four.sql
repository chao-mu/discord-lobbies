CREATE TABLE IF NOT EXISTS "bulletins" (
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" integer NOT NULL,
	"lobby_id" integer NOT NULL,
	"last_joined" timestamp NOT NULL,
	"discord_guild_id" text NOT NULL,
	"bulletin" text DEFAULT '' NOT NULL,
	CONSTRAINT "bulletins_user_id_lobby_id_discord_guild_id_pk" PRIMARY KEY("user_id","lobby_id","discord_guild_id")
);
--> statement-breakpoint
DROP TABLE "lobbies_users";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "lobbies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
