// Moment
import moment from "moment";

// Ours
import type { CommandBuilder } from "@/types";
import { getLobbies, getLobby, joinLobby } from "@/model/lobby";
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
                "Describe what you're looking for. Other players will see this when they join.",
              )
              .setRequired(true),
          ),
      );
    });

    return builder;
  },
  async execute({ interaction, db }) {
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
      userId: user.id,
      lobbyId: lobby.id,
      blurb: blurb,
    });

    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      await interaction.reply(`You already joined ${timeAgo}!`);
      return;
    }

    await interaction.reply(`Joined the ${lobbyName} lobby`);
  },
} satisfies CommandBuilder;
