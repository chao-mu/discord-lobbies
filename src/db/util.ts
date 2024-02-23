// Discord
import { User } from "discord.js";

// Drizzle
import { eq, and } from "drizzle-orm";

// Ours
import {
  users,
  lobbies,
  lobbiesUsers,
  Transaction,
  timestampsDefaults,
} from "../db";

export async function getUser(db: Transaction, user: User) {
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

export async function getLobby(db: Transaction, name: string) {
  const lobbyResults = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.name, name));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby ${name} not found`);
  }

  return lobbyResults[0];
}

export async function leaveLobbies(db: Transaction, userId: number) {
  await db.delete(lobbiesUsers).where(eq(lobbiesUsers.userId, userId));
}

export async function leaveLobby(
  db: Transaction,
  userId: number,
  lobbyId: number,
) {
  await db
    .delete(lobbiesUsers)
    .where(
      and(eq(lobbiesUsers.userId, userId), eq(lobbiesUsers.lobbyId, lobbyId)),
    );
}

export async function joinLobby({
  userId,
  lobbyId,
  blurb,
  db,
}: {
  db: Transaction;
  userId: number;
  lobbyId: number;
  blurb: string;
}) {
  const { createdAt, updatedAt } = timestampsDefaults();
  const update = {
    lastJoined: new Date(),
    updatedAt,
    blurb,
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
