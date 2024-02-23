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
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((command) => command.data),
    });
  } catch (error) {
    console.error(`Error deploying commands: ${error}`);
  }
}
export function registerCommands(commands: Command[], client: Client): void {
  const commandLookup: Map<string, Command> = commands.reduce(
    (acc, command) => acc.set(command.data.name, command),
    new Map(),
  );

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const name = interaction.commandName;

    if (!commandLookup.has(name)) {
      throw new Error(`Command '${name}' not found.`);
    }

    const command = commandLookup.get(interaction.commandName);

    try {
      await db.transaction(async (tx) => {
        await command.execute({ interaction, tx });
      });
    } catch (error) {
      console.error(`Error executing ${name}: ${error}`);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
}
