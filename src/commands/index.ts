import { SlashCommandBuilder, Client, Events, REST, Routes } from "discord.js";

// Ours
import { discordToken, clientId } from "@/config";
import { Command } from "@/types";

import commands from "./autoload";

import { db } from "@/db";

export async function loadCommands() {
  return Promise.all<Command>(
    commands.map(async (command) => {
      const builder = await command.build({
        builder: new SlashCommandBuilder(),
      });
      const data = builder.toJSON();

      return {
        ...command,
        data,
      };
    }),
  );
}

export async function deployCommands(commands: Command[], guildId: string) {
  const rest = new REST().setToken(discordToken);

  try {
    const body = commands.map((command) => command.data);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: body,
      },
    );

    const count =
      (data as { length: number })?.length ?? "an unknown number of";
    console.log(`Successfully registered ${count} commands.`);
  } catch (error) {
    console.error(`Error deploying commands: ${error}`);
  }
}
export function registerCommands(commands: Command[], client: Client): void {
  const commandLookup: Record<string, Command> = Object.fromEntries(
    commands.map((command) => [command.data.name, command]),
  );

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const name = interaction.commandName;

    if (!commandLookup[name]) {
      const err = `Unexpected error! Command '${name}' not found.`;
      interaction.reply(err);
      console.error(err);
    }

    const command = commandLookup[interaction.commandName];

    try {
      await db.transaction(async (tx) => {
        await command.execute({ interaction, db: tx });
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
