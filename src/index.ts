// Core
import process from "node:process";

// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import { registerCommands } from "./commands/router";
import { registerEvents } from "./events/router";

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerCommands(client);
registerEvents(client);

// Login to the client
void client.login(process.env.DISCORD_TOKEN);
