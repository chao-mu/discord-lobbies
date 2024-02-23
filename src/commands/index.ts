import { Client, Events, REST, Routes } from "discord.js";

// Ours
import { discordToken, clientId } from "../config";
import { Command } from "./types";
import Ping from "./ping";
import JoinLobby from "./join-lobby";
import { db } from "../db";

export const getCommands = () => [Ping, JoinLobby];

export async function deployCommands(commands: Command[], guildId: string) {
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
export function registerCommands(commands: Command[], client: Client): void {
  const commandLookup: Map<string, Command> = commands.reduce(
    (acc, command) => acc.set(command.data.name, command),
    new Map(),
  );

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    if (!commandLookup.has(interaction.commandName)) {
      throw new Error(`Command '${interaction.commandName}' not found.`);
    }

    const command = commandLookup.get(interaction.commandName);

    try {
      await db.transaction(async (tx) => {
        await command.execute({ interaction, tx });
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
}
