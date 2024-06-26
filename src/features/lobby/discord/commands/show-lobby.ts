// Discord.js
import { TextChannel } from "discord.js";

// Ours
import type { CommandBuilder } from "@/discord/commands";
import {
  deleteLobbyEmbeds,
  getLobbies,
  getLobbyBulletins,
  getLobbyByName,
  upsertLobbyEmbed,
} from "@/features/lobby/model";
import { db } from "@/db";
import {
  buildLobbyEmbed,
  buildLobbyActions,
} from "@/features/lobby/discord/ui";
import { replyEphemeralSuccess } from "@/discord/util";
import { purgeLobbyMessages } from "../util";

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("show-lobby")
      .setDescription("Show lobby listing");

    const lobbies = await getLobbies(db);
    lobbies.forEach((lobby) => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName(lobby.name).setDescription(lobby.description),
      );
    });

    return builder;
  },
  async execute({ interaction, db }) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This command must be used in a server");
      return;
    }
    const lobbyName = interaction.options.getSubcommand();
    if (!lobbyName) {
      await interaction.reply("You must provide a lobby name");
      return;
    }

    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) {
      await interaction.reply("This command must be used in a channel");
      return;
    }

    const lobby = await getLobbyByName(db, lobbyName);
    const bulletins = await getLobbyBulletins(db, guild.id, lobbyName);

    // Clear existing ones
    await purgeLobbyMessages({ db, lobby, channel });

    const message = await channel.send({
      embeds: [buildLobbyEmbed(lobby, bulletins)],
      components: [buildLobbyActions(lobby)],
    });

    // Add the new one
    await upsertLobbyEmbed({
      db,
      lobbyId: lobby.id,
      discordChannelId: channel.id,
      discordMessageId: message.id,
    });

    await replyEphemeralSuccess(interaction);
  },
} satisfies CommandBuilder;
