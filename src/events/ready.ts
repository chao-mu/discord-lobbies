// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/types";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
} satisfies Event<Events.ClientReady>;
