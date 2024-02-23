import { db } from "./db";
import { lobbies } from "./schema";
import { timestampsDefaults } from "./util";

const defaultLobbies = [
  {
    name: "game-reviews",
    description: "A lobby for reviewing each other's games.",
  },
  {
    name: "sparring",
    description:
      "A lobby for finding opponents to play sparing positions with.",
  },
];

db.transaction(async (tx) => {
  const { createdAt, updatedAt } = timestampsDefaults();

  for (const lobby of defaultLobbies) {
    const update = {
      ...lobby,
      updatedAt,
    };

    await tx
      .insert(lobbies)
      .values({
        ...update,
        createdAt,
        name: lobby.name,
      })
      .onConflictDoUpdate({
        target: [lobbies.name],
        set: update,
      });
  }
});
