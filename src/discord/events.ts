// Discord.js
import type {
  ChatInputCommandInteraction,
  ClientEvents,
  Client,
} from "discord.js";

// Ours
import type { DB } from "@/db";

// Ours - Events
import { getLobbyEventHandlers } from "@/features/lobby/discord";

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

export const getEventHandlers = () => getLobbyEventHandlers();

export function registerEvents(events: Event[], client: Client) {
  for (const event of events) {
    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args),
    );
  }
}
