CREATE TABLE IF NOT EXISTS "guild_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"member_id" text NOT NULL,
	"guild_id" text NOT NULL
);
