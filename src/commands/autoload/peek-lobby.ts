// Drizzle
import { eq } from "drizzle-orm";

// Ours
import type { CommandBuilder } from "@/commands/types";

import { lobbies, db, lobbiesUsers, users } from "@/db";

type BlurbEntry = { lobbyName: string; discordUsername: string; blurb: string };

function prerttyBlurbs(blurbs: BlurbEntry[]) {
  return blurbs
    .map(
      (blurb) =>
        `**${blurb.lobbyName}** - ${blurb.discordUsername}: ${blurb.blurb}`,
    )
    .join("\n");
}

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("peek-lobby")
      .setDescription(
        "Peek inside a lobby without joining it or notifying anyone",
      );

    builder.addSubcommand((subcommand) =>
      subcommand.setName("all").setDescription("Peek inside all lobbies"),
    );

    const lobbiesRes = await db
      .select({ name: lobbies.name, description: lobbies.description })
      .from(lobbies);
    lobbiesRes.forEach((lobby) => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName(lobby.name).setDescription(lobby.description),
      );
    });

    return builder;
  },
  async execute({ interaction, db }) {
    const lobbyName = interaction.options.getSubcommand();

    const query = db
      .select({
        lobbyName: lobbies.name,
        discordUsername: users.discordUsername,
        blurb: lobbiesUsers.blurb,
      })
      .from(lobbiesUsers)
      .innerJoin(lobbies, eq(lobbiesUsers.lobbyId, lobbies.id))
      .innerJoin(users, eq(lobbiesUsers.userId, users.id));

    let blurbs: BlurbEntry[] = [];

    if (lobbyName == "all") {
      blurbs = await query;
    } else {
      blurbs = await query.where(eq(lobbies.name, lobbyName));
    }

    if (blurbs.length === 0) {
      await interaction.reply(
        "No one is in that/those lobbies! Join to get notified when people join.",
      );
      return;
    }

    const msg = prerttyBlurbs(blurbs);
    await interaction.reply(msg);
  },
} satisfies CommandBuilder;
