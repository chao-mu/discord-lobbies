import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  ...timestamps,
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
});

export const lobbies = pgTable("lobbies", {
  id: serial("id").primaryKey(),
  ...timestamps,
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
});

export const lobbiesUsers = pgTable(
  "lobbies_users",
  {
    ...timestamps,
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    lobbyId: integer("lobby_id")
      .notNull()
      .references(() => lobbies.id),
    lastJoined: timestamp("last_joined").notNull(),
    blurb: text("blurb").notNull().default(""),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.lobbyId] }),
  }),
);
