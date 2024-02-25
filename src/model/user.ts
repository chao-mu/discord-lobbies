// Discord
import { User as DiscordUser } from "discord.js";

// Drizzle
import { eq } from "drizzle-orm";

// Ours
import { DB } from "@/db";
import { users } from "@/db/schema";
import { timestampsDefaults } from "@/db/util";

type User = typeof users.$inferSelect;

export async function getUser(db: DB, discordId: string) {
  return await db.select().from(users).where(eq(users.discordId, discordId));
}

export async function getOrUpsertUser(
  db: DB,
  user: DiscordUser,
): Promise<User> {
  const { id, username, discriminator } = user;
  const discordUsername = `${username}#${discriminator}`;

  const { createdAt, updatedAt } = timestampsDefaults();

  await db
    .insert(users)
    .values({
      discordId: id,
      discordUsername,
      createdAt,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: users.discordId,
      set: { discordUsername, updatedAt },
    });

  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.discordId, id));

  if (userResults.length === 0) {
    throw new Error("User unexpectedly not found");
  }

  return userResults[0];
}
