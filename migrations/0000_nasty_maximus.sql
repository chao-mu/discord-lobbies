CREATE TABLE IF NOT EXISTS "lobbies" (
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lobbies_users" (
	"created_at" timestamp NOT NULL,
	"user_id" integer NOT NULL,
	"lobby_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobbies_users" ADD CONSTRAINT "lobbies_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobbies_users" ADD CONSTRAINT "lobbies_users_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "lobbies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
