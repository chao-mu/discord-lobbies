import { Client } from "discord.js";
import Ready from "./ready";
import type { Event } from "@/types";

export const getEventHandlers = () => [Ready];

export function registerEvents(events: Event[], client: Client) {
  for (const event of events) {
    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args),
    );
  }
}
