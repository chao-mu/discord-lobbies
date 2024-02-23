import type { CommandBuilder } from "./types";

export default {
  build: async ({ builder }) => builder.setName("ping").setDescription("Ping!"),
  async execute({ interaction }) {
    await interaction.reply("Pong!");
  },
} satisfies CommandBuilder;
