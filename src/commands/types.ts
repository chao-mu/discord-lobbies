import type {
  RESTPostAPIApplicationCommandsJSONBody,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import type { Transaction } from "../db";

export type CommandExecuteArgs = {
  interaction: ChatInputCommandInteraction;
  tx: Transaction;
};

export type CommandExecuter = {
  execute(args: CommandExecuteArgs): Promise<void> | void;
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
