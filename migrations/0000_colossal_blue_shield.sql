CREATE TABLE IF NOT EXISTS "bulletins" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" integer NOT NULL,
	"lobby_id" integer NOT NULL,
	"last_joined" timestamp NOT NULL,
	"discord_guild_id" text NOT NULL,
	"bulletin" text DEFAULT '' NOT NULL,
	CONSTRAINT "bulletins_user_id_lobby_id_discord_guild_id_unique" UNIQUE("user_id","lobby_id","discord_guild_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lobbies" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "lobbies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"discord_id" text NOT NULL,
	"discord_username" text NOT NULL,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
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
