// Discord.js
import { Client } from "discord.js";

// Ours
import Ready from "./ready";
import JoinLobby from "./join-lobby";
import type { Event } from "@/types";

export const getEventHandlers = () => [Ready, JoinLobby];

export function registerEvents(events: Event[], client: Client) {
  for (const event of events) {
    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args),
    );
  }
}
