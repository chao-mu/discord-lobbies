// Moment
import moment from "moment";

// Ours
import type { CommandBuilder } from "@/types";
import {
  getLobbies,
  getLobby,
  getLobbyBulletins,
  joinLobby,
} from "@/model/lobby";
import { getUser } from "@/model/user";
import { db } from "@/db";

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("join-lobby")
      .setDescription("Join a lobby to be paired with other players");

    const lobbies = await getLobbies(db);
    lobbies.forEach((lobby) => {
      builder.addSubcommand((subcommand) =>
        subcommand
          .setName(lobby.name)
          .setDescription(lobby.description)
          .addStringOption((option) =>
            option
              .setName("bulletin")
              .setDescription(
                "Describe what you're looking for. Other players will see this when you join.",
              )
              .setRequired(true),
          ),
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

    const bulletin = interaction.options.getString("bulletin");
    if (!bulletin) {
      await interaction.reply("You must provide a bulletin to join a lobby");
      return;
    }

    const user = await getUser(db, interaction.user);
    const lobby = await getLobby(db, lobbyName);

    const previousJoined = await joinLobby({
      db,
      bulletin,
      userId: user.id,
      lobbyId: lobby.id,
      discordGuildId: guild.id,
    });

    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      await interaction.reply(
        `You already joined ${timeAgo}! Renewing your timeout.`,
      );
      return;
    }

    const bulletins = await getLobbyBulletins(db, guild.id, lobbyName).then(
      (bulletins) => bulletins.filter(({ userId }) => userId !== user.id),
    );

    for (const { discordId } of bulletins) {
      const member = await guild.members.fetch(discordId);
      const displayName = interaction.user.displayName;

      await member.send(
        `${displayName} has joined the ${lobbyName} lobby on ${guild.name}. They're looking for: ${bulletin}`,
      );
    }

    let replyMsg = `You have joined the ${lobbyName} lobby. The ${bulletins.length} other players in the lobby have been messaged.`;
    if (bulletins.length === 0) {
      replyMsg +=
        "\nOh, you're the only one here :-(. Maybe play some blunder games while you wait for others to join?";
    }

    await interaction.reply(replyMsg);
  },
} satisfies CommandBuilder;
