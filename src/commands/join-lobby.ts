// Discord
import { User } from "discord.js";

// Ours
import type { Command } from "./types";
import { users, Transaction, timestampsDefaults } from "../db";
import { eq } from "drizzle-orm";

async function getUser(tx: Transaction, user: User) {
  const { id, username, discriminator } = user;
  const discordUsername = `${username}#${discriminator}`;

  const { createdAt, updatedAt } = timestampsDefaults();

  await tx
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

  const userResults = await tx
    .select()
    .from(users)
    .where(eq(users.discordId, id));

  if (userResults.length === 0) {
    throw new Error("User unexpectedly not found");
  }

  return userResults[0];
}

export default {
  data: {
    name: "join-lobby",
    description: "Join the lobby to be paired with other players",
  },
  async execute({ interaction, tx }) {
    const user = await getUser(tx, interaction.user);
    console.log("User", user);
    await interaction.reply("You have been added to the lobby.");
  },
} satisfies Command;
