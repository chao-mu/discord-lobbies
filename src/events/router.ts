import { Client } from "discord.js";
import Ready from "./ready";
import type { Event } from "./types";

const eventHandlers: Event[] = [Ready];

export function registerEvents(client: Client) {
  for (const event of eventHandlers) {
    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args),
    );
  }
}
