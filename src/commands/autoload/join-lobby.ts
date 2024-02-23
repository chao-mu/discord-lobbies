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
              .setName("blurb")
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
    const blurb = interaction.options.getString("blurb");

    if (!blurb) {
      await interaction.reply("You must provide a blurb to join a lobby");
      return;
    }

    const user = await getUser(db, interaction.user);
    const lobby = await getLobby(db, lobbyName);

    const previousJoined = await joinLobby({
      db,
      blurb,
      userId: user.id,
      lobbyId: lobby.id,
    });

    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      await interaction.reply(
        `You already joined ${timeAgo}! Renewing your timeout.`,
      );
      return;
    }

    const bulletins = await getLobbyBulletins(db, lobbyName);

    for (const { discordId } of bulletins) {
      const member = await guild.members.fetch(discordId);
      await member.send(
        `${user.discordUsername} has joined the ${lobbyName} lobby on ${guild.name}. They're looking for: ${blurb}`,
      );
    }

    const replyMsg = `You have joined the ${lobbyName} lobby. ${bulletins.length} other players in the lobby have been messaged.`;
    await interaction.reply(replyMsg);
  },
} satisfies CommandBuilder;
