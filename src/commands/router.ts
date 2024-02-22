import { Client, Events, REST, Routes } from "discord.js";

import { discordToken, clientId } from "../config";
import { Command } from "./types";
import Ping from "./ping";

export const commands: Command[] = [Ping];

const commandLookup = Object.fromEntries(
  commands.map((command) => [command.data.name, command]),
);

export async function deployCommands(guildId: string) {
  const rest = new REST().setToken(discordToken);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: commands.map((command) => command.data),
      },
    );

    console.log(`Successfully reloaded application (/) commands.`);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
export function registerCommands(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commandLookup[interaction.commandName];

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
