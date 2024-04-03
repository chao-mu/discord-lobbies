// Ours
import type { CommandBuilder } from "@/types";

import { db } from "@/db";
import { getLobbies, getLobbyBulletins, Bulletin } from "@/model/lobby";

const prettyBulletinBoard = (bulletins: Bulletin[]) =>
  bulletins
    .map(
      (bulletin) =>
        `**${bulletin.lobbyName}** - ${bulletin.discordUsername}: ${bulletin.bulletin}`,
    )
    .join("\n");

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

    const lobbies = await getLobbies(db);
    lobbies.forEach((lobby) => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName(lobby.name).setDescription(lobby.description),
      );
    });

    return builder;
  },
  async execute({ interaction, db }) {
    if (!interaction.guild) {
      await interaction.reply("This command must be used in a server");
      return;
    }

    const lobbyName = interaction.options.getSubcommand();
    if (!lobbyName) {
      await interaction.reply("You must provide a lobby name");
      return;
    }

    const bulletins = await getLobbyBulletins(
      db,
      interaction.guild.id,
      lobbyName === "all" ? undefined : lobbyName,
    );

    if (bulletins.length === 0) {
      await interaction.reply(
        "No one is in that/those lobbies! Join to get notified when people join.",
      );
      return;
    }

    const msg = prettyBulletinBoard(bulletins);
    await interaction.reply(msg);
  },
} satisfies CommandBuilder;
