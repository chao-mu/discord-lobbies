import { db } from "./db";
import { lobbies, timestampsDefaults } from "./schema";

const defaultLobbies = [
  {
    name: "game-reviews",
  },
];

db.transaction(async (tx) => {
  const existingLobbies = await tx.select().from(lobbies);

  const base = timestampsDefaults();

  for (const { name } of defaultLobbies) {
    if (!existingLobbies.some((lobby) => lobby.name === name)) {
      console.log(`Seeding lobby: ${name}`);
      await tx.insert(lobbies).values({
        ...base,
        name,
      });
    }
  }
});
