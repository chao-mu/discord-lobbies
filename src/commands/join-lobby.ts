// Discord
import { User } from "discord.js";

// Moment
import moment from "moment";

// Ours
import type { CommandBuilder } from "./types";
import {
  users,
  lobbies,
  lobbiesUsers,
  Transaction,
  timestampsDefaults,
  db,
} from "../db";
import { eq, and } from "drizzle-orm";

async function getUser(db: Transaction, user: User) {
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

async function getLobby(db: Transaction, name: string) {
  const lobbyResults = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.name, name));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby ${name} not found`);
  }

  return lobbyResults[0];
}

async function joinLobby(db: Transaction, userId: number, lobbyId: number) {
  const { createdAt, updatedAt } = timestampsDefaults();
  const update = {
    lastJoined: new Date(),
    updatedAt,
  };

  const previousJoinedResult = await db
    .select({ lastJoined: lobbiesUsers.lastJoined })
    .from(lobbiesUsers)
    .where(
      and(eq(lobbiesUsers.userId, userId), eq(lobbiesUsers.lobbyId, lobbyId)),
    );

  const previousJoined = previousJoinedResult[0]?.lastJoined;

  await db
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
  build: async ({ builder }) => {
    builder = builder
      .setName("join-lobby")
      .setDescription("Join a lobby to be paired with other players");

    const lobbiesRes = await db.select().from(lobbies);
    lobbiesRes.forEach((lobby) => {
      console.log("Registering subcommand for lobby", lobby.name);
      builder.addSubcommand((subcommand) =>
        subcommand.setName(lobby.name).setDescription(lobby.description),
      );
    });

    return builder;
  },
  async execute({ interaction, tx }) {
    const lobbyName = interaction.options.getSubcommand();
    const user = await getUser(tx, interaction.user);
    const lobby = await getLobby(tx, lobbyName);

    const previousJoined = await joinLobby(tx, user.id, lobby.id);

    let msg = `Joined the ${lobbyName} lobby`;
    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      msg += `. Previously joined ${timeAgo}.`;
    }

    await interaction.reply(msg);
  },
} satisfies CommandBuilder;
