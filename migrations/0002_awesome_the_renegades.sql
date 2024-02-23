ALTER TABLE "lobbies_users" ADD CONSTRAINT "lobbies_users_user_id_lobby_id_pk" PRIMARY KEY("user_id","lobby_id");--> statement-breakpoint
ALTER TABLE "lobbies_users" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "lobbies_users" ADD COLUMN "last_joined" timestamp NOT NULL;