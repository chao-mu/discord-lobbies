// Discord
import { User } from "discord.js";

// Moment
import moment from "moment";

// Ours
import type { Command } from "./types";
import {
  users,
  lobbies,
  lobbiesUsers,
  Transaction,
  timestampsDefaults,
} from "../db";
import { eq, and } from "drizzle-orm";

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

async function getLobby(tx: Transaction, name: string) {
  const lobbyResults = await tx
    .select()
    .from(lobbies)
    .where(eq(lobbies.name, name));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby ${name} not found`);
  }

  return lobbyResults[0];
}

async function joinLobby(tx: Transaction, userId: number, lobbyId: number) {
  const { createdAt, updatedAt } = timestampsDefaults();
  const update = {
    lastJoined: new Date(),
    updatedAt,
  };

  const previousJoinedResult = await tx
    .select({ lastJoined: lobbiesUsers.lastJoined })
    .from(lobbiesUsers)
    .where(
      and(eq(lobbiesUsers.userId, userId), eq(lobbiesUsers.lobbyId, lobbyId)),
    );

  const previousJoined = previousJoinedResult[0]?.lastJoined;

  await tx
    .insert(lobbiesUsers)
    .values({
      ...update,
      createdAt,
      userId: userId,
      lobbyId: lobbyId,
    })
    .onConflictDoUpdate({
      target: [lobbiesUsers.userId, lobbiesUsers.lobbyId],
      set: update,
    });

  return previousJoined;
}

export default {
  data: {
    name: "join-lobby",
    description: "Join the lobby to be paired with other players",
  },
  async execute({ interaction, tx }) {
    const user = await getUser(tx, interaction.user);
    const lobby = await getLobby(tx, "game-reviews");

    const previousJoined = await joinLobby(tx, user.id, lobby.id);

    let msg = "Joined lobby";
    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      msg += `. Previously joined ${timeAgo}.`;
    }

    await interaction.reply(msg);
  },
} satisfies Command;
