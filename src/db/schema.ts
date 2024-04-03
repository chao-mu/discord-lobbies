import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const lobbiesEmbeds = pgTable(
  "lobbies_embeds",
  {
    ...timestamps,
    discordChannelId: text("discord_channel_id").notNull(),
    discordMessageId: text("discord_message_id").notNull(),
    lobbyId: integer("lobby_id")
      .notNull()
      .references(() => lobbies.id),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.lobbyId, table.discordChannelId],
    }),
    unq: unique().on(
      table.lobbyId,
      table.discordChannelId,
      table.discordMessageId,
    ),
  }),
);

export const bulletins = pgTable(
  "bulletins",
  {
    id: serial("id").primaryKey(),
    ...timestamps,
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    lobbyId: integer("lobby_id")
      .notNull()
      .references(() => lobbies.id),
    lastJoined: timestamp("last_joined").notNull(),
    discordGuildId: text("discord_guild_id").notNull(),
    bulletin: text("bulletin").notNull().default(""),
  },
  (table) => ({
    unq: unique().on(table.userId, table.lobbyId, table.discordGuildId),
  }),
);
