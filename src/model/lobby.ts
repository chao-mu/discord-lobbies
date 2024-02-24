// Drizzle
import { eq, and } from "drizzle-orm";

// Ours
import { lobbies, lobbiesUsers, users } from "@/db/schema";
import { DB } from "@/db";
import { timestampsDefaults } from "@/db/util";

export type Lobby = typeof lobbies.$inferSelect;

export type Bulletin = {
  lobbyName: string;
  discordUsername: string;
  discordId: string;
  discordGuildId: string;
  userId: number;
  blurb: string;
};

export function getLobbyBulletins(
  db: DB,
  discordGuildId: string,
  lobbyName?: string,
): Promise<Bulletin[]> {
  const conditions = [eq(lobbiesUsers.discordGuildId, discordGuildId)];
  const query = db
    .select({
      lobbyName: lobbies.name,
      discordUsername: users.discordUsername,
      userId: lobbiesUsers.userId,
      blurb: lobbiesUsers.blurb,
      discordId: users.discordId,
      discordGuildId: lobbiesUsers.discordGuildId,
    })
    .from(lobbiesUsers)
    .innerJoin(
      lobbies,
      and(
        eq(lobbiesUsers.lobbyId, lobbies.id),
        eq(lobbiesUsers.discordGuildId, discordGuildId),
      ),
    )
    .innerJoin(users, eq(lobbiesUsers.userId, users.id));

  if (lobbyName) {
    conditions.push(eq(lobbies.name, lobbyName));
  }

  return query.where(and(...conditions));
}

export const getLobbies = (db: DB): Promise<Lobby[]> =>
  db.select().from(lobbies);

export async function getLobby(db: DB, name: string) {
  const lobbyResults = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.name, name));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby ${name} not found`);
  }

  return lobbyResults[0];
}

export async function leaveLobbies(db: DB, userId: number) {
  await db.delete(lobbiesUsers).where(eq(lobbiesUsers.userId, userId));
}

export async function leaveLobby(db: DB, userId: number, lobbyId: number) {
  await db
    .delete(lobbiesUsers)
    .where(
      and(eq(lobbiesUsers.userId, userId), eq(lobbiesUsers.lobbyId, lobbyId)),
    );
}

export async function joinLobby({
  userId,
  lobbyId,
  discordGuildId,
  blurb,
  db,
}: {
  db: DB;
  userId: number;
  lobbyId: number;
  discordGuildId: string;
  blurb: string;
}): Promise<Date> {
  const { createdAt, updatedAt } = timestampsDefaults();
  const update = {
    lastJoined: new Date(),
    updatedAt,
    blurb,
    discordGuildId,
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
      target: [
        lobbiesUsers.userId,
        lobbiesUsers.lobbyId,
        lobbiesUsers.discordGuildId,
      ],
      set: update,
    });

  return previousJoined;
}
