import type { Command } from "./types";

export default {
  data: {
    name: "ping",
    description: "Ping!",
  },
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
} satisfies Command;
