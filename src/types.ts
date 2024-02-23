// Discord.js
import type {
  RESTPostAPIApplicationCommandsJSONBody,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ClientEvents,
} from "discord.js";

// Ours
import type { DB } from "@/db";

export type Event<T extends keyof ClientEvents = keyof ClientEvents> = {
  execute(...parameters: ClientEvents[T]): Promise<void> | void;
  name: T;
  once?: boolean;
};

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
