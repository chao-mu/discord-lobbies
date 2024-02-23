// Moment
import moment from "moment";

// Ours
import type { CommandBuilder } from "./types";

import { lobbies, db, getUser, getLobby, joinLobby } from "../db";

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("join-lobby")
      .setDescription("Join a lobby to be paired with other players");

    builder;
    const lobbiesRes = await db
      .select({
        name: lobbies.name,
        description: lobbies.description,
      })
      .from(lobbies);
    lobbiesRes.forEach((lobby) => {
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
    const user = await getUser(db, interaction.user);
    const lobby = await getLobby(db, lobbyName);

    const previousJoined = await joinLobby({
      db,
      userId: user.id,
      lobbyId: lobby.id,
      blurb: blurb,
    });

    let msg = `Joined the ${lobbyName} lobby`;
    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      msg += `. Previously joined ${timeAgo}.`;
    }

    await interaction.reply(msg);
  },
} satisfies CommandBuilder;
