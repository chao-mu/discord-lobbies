// Discord.js
import { Client } from "discord.js";

// Ours
import ReadyEvent from "./ready";
import JoinLobbyButtonEvent from "./join-lobby-button";
import LeaveLobbyButtonEvent from "./leave-lobby-button";
import JoinLobbyModalEvent from "./join-lobby-modal";
import type { Event } from "@/discord/events";

export const getEventHandlers = () => [
  ReadyEvent,
  JoinLobbyButtonEvent,
  LeaveLobbyButtonEvent,
  JoinLobbyModalEvent,
];

export function registerEvents(events: Event[], client: Client) {
  for (const event of events) {
    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args),
    );
  }
}
