import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
};

export const timestampsDefaults = () => {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
  };
};

const base = {
  ...timestamps,
  id: serial("id").primaryKey(),
};

export const users = pgTable("users", {
  ...base,
  discordId: text("discord_id").notNull(),
});

export const lobbies = pgTable("lobbies", {
  ...base,
  name: text("name").notNull(),
});

export const lobbiesUsers = pgTable("lobbies_users", {
  createdAt: timestamp("created_at").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  lobbyId: integer("lobby_id")
    .notNull()
    .references(() => lobbies.id),
});
