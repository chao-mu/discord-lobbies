import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const guildMembers = pgTable("guild_members", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  memberId: text("member_id").notNull(),
  guildId: text("guild_id").notNull(),
});
