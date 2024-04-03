// Discord.js
import {
  type RESTPostAPIApplicationCommandsJSONBody,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  Routes,
  Client,
  Events,
  REST,
} from "discord.js";

// Ours
import { type DB, db } from "@/db";
import { config } from "@/config";

// Ours - Commands
import { getLobbyCommandBuilders } from "@/features/lobby/discord";

export type CommandExecuter = {
  execute(args: {
    interaction: ChatInputCommandInteraction;
    db: DB;
  }): Promise<void> | void;
};

export type CommandBuilder = {
  build: ({
    builder,
  }: {
    builder: SlashCommandBuilder;
  }) => Promise<SlashCommandBuilder>;
} & CommandExecuter;

export type Command = {
  data: RESTPostAPIApplicationCommandsJSONBody;
} & CommandExecuter;

export const commandBuilders: CommandBuilder[] = getLobbyCommandBuilders();

export async function getCommands() {
  return Promise.all<Command>(
    commandBuilders.map(async (command) => {
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
  const rest = new REST().setToken(config.discordToken);

  try {
    const body = commands.map((command) => command.data);

    const data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, guildId),
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
