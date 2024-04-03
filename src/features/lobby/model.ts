// Drizzle
import { eq, and } from "drizzle-orm";

// Ours
import { lobbies, bulletins, users, lobbiesEmbeds } from "@/db/schema";
import { DB } from "@/db";
import { timestampsDefaults } from "@/db/util";

export type Lobby = typeof lobbies.$inferSelect;

export type Bulletin = {
  id: number;
  lobbyName: string;
  discordUsername: string;
  discordId: string;
  discordGuildId: string;
  userId: number;
  bulletin: string;
};

export function getLobbyBulletins(
  db: DB,
  discordGuildId: string,
  lobbyName?: string,
): Promise<Bulletin[]> {
  const conditions = [eq(bulletins.discordGuildId, discordGuildId)];
  const query = db
    .select({
      id: bulletins.id,
      lobbyName: lobbies.name,
      discordUsername: users.discordUsername,
      userId: bulletins.userId,
      bulletin: bulletins.bulletin,
      discordId: users.discordId,
      discordGuildId: bulletins.discordGuildId,
    })
    .from(bulletins)
    .innerJoin(
      lobbies,
      and(
        eq(bulletins.lobbyId, lobbies.id),
        eq(bulletins.discordGuildId, discordGuildId),
      ),
    )
    .innerJoin(users, eq(bulletins.userId, users.id));

  if (lobbyName) {
    conditions.push(eq(lobbies.name, lobbyName));
  }

  return query.where(and(...conditions));
}

export const getLobbies = (db: DB): Promise<Lobby[]> =>
  db.select().from(lobbies);

export async function getLobby(db: DB, id: number) {
  const lobbyResults = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.id, id));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby with id ${id} not found`);
  }

  return lobbyResults[0];
}

export async function getLobbyByName(db: DB, name: string) {
  const lobbyResults = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.name, name));

  if (lobbyResults.length === 0) {
    throw new Error(`Lobby ${name} not found`);
  }

  return lobbyResults[0];
}

export async function upsertLobbyEmbed({
  db,
  lobbyId,
  discordChannelId,
  discordMessageId,
}: {
  db: DB;
  lobbyId: number;
  discordChannelId: string;
  discordMessageId: string;
}) {
  const { createdAt, updatedAt } = timestampsDefaults();

  await db
    .insert(lobbiesEmbeds)
    .values({
      discordChannelId,
      discordMessageId,
      lobbyId,
      createdAt,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [lobbiesEmbeds.discordChannelId, lobbiesEmbeds.lobbyId],
      set: { discordMessageId, updatedAt },
    });
}

export async function leaveLobbies(db: DB, userId: number) {
  await db.delete(bulletins).where(eq(bulletins.userId, userId));
}

export async function getLobbyEmbeds(db: DB, lobbyId: number) {
  return db
    .select()
    .from(lobbiesEmbeds)
    .where(eq(lobbiesEmbeds.lobbyId, lobbyId));
}

export async function leaveLobby(db: DB, userId: number, lobbyId: number) {
  await db
    .delete(bulletins)
    .where(and(eq(bulletins.userId, userId), eq(bulletins.lobbyId, lobbyId)));
}

export async function joinLobby({
  userId,
  lobbyId,
  discordGuildId,
  bulletin,
  db,
}: {
  db: DB;
  userId: number;
  lobbyId: number;
  discordGuildId: string;
  bulletin: string;
}): Promise<Date> {
  const { createdAt, updatedAt } = timestampsDefaults();
  const update = {
    lastJoined: new Date(),
    updatedAt,
    bulletin,
    discordGuildId,
  };

  const previousJoinedResult = await db
    .select({ lastJoined: bulletins.lastJoined })
    .from(bulletins)
    .where(and(eq(bulletins.userId, userId), eq(bulletins.lobbyId, lobbyId)));

  const previousJoined = previousJoinedResult[0]?.lastJoined;

  await db
    .insert(bulletins)
    .values({
      ...update,
      createdAt,
      userId: userId,
      lobbyId: lobbyId,
    })
    .onConflictDoUpdate({
      target: [bulletins.userId, bulletins.lobbyId, bulletins.discordGuildId],
      set: update,
    });

  return previousJoined;
}
