// Ours
import type { CommandBuilder } from "@/commands/types";

import { getUser, getLobby, lobbies, leaveLobby, leaveLobbies, db } from "@/db";

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("leave-lobby")
      .setDescription("Leave lobbies inorder to no longer be pinged.");

    builder.addSubcommand((subcommand) =>
      subcommand.setName("all").setDescription("Leave all lobbies"),
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
    const user = await getUser(db, interaction.user);

    let msg = "";
    if (lobbyName == "all") {
      await leaveLobbies(db, user.id);

      msg = "You have left every lobby.";
    } else {
      const lobby = await getLobby(db, lobbyName);
      await leaveLobby(db, user.id, lobby.id);

      msg = `You have left the ${lobbyName} lobby`;
    }

    await interaction.reply(
      msg +
        ". You will no longer be listed in the lobbies you've left, nor be pinged about people joining them.",
    );
  },
} satisfies CommandBuilder;
