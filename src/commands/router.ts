import { Command } from "./types";

import { Client, Events } from "discord.js";

import Ping from "./ping";

const routes = {
  ping: Ping,
} satisfies Record<string, Command>;

export function registerCommands(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = routes[interaction.commandName];

    if (!command) {
      throw new Error(`Command '${interaction.commandName}' not found.`);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
}
