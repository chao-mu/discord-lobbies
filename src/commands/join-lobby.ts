import type { Command } from "./types";

export default {
  data: {
    name: "join-lobby",
    description: "Join the lobby to be paired with other players",
  },
  async execute(interaction) {
    await interaction.reply("You have been added to the lobby.");
  },
} satisfies Command;
