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

    const lobbiesRes = await db.select().from(lobbies);
    lobbiesRes.forEach((lobby) => {
      console.log("Registering subcommand for lobby", lobby.name);
      builder.addSubcommand((subcommand) =>
        subcommand.setName(lobby.name).setDescription(lobby.description),
      );
    });

    return builder;
  },
  async execute({ interaction, tx }) {
    const lobbyName = interaction.options.getSubcommand();
    const user = await getUser(tx, interaction.user);
    const lobby = await getLobby(tx, lobbyName);

    const previousJoined = await joinLobby(tx, user.id, lobby.id);

    let msg = `Joined the ${lobbyName} lobby`;
    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      msg += `. Previously joined ${timeAgo}.`;
    }

    await interaction.reply(msg);
  },
} satisfies CommandBuilder;
