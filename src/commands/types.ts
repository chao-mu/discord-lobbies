import type {
  RESTPostAPIApplicationCommandsJSONBody,
  CommandInteraction,
} from "discord.js";

/**
 * Defines the structure of a command
 */
export type Command = {
  /**
   * The data for the command
   */
  data: RESTPostAPIApplicationCommandsJSONBody;
  /**
   * The function to execute when the command is called
   *
   * @param interaction - The interaction of the command
   */
  execute(interaction: CommandInteraction): Promise<void> | void;
};
