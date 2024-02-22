// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import { registerCommands } from "./commands/router";
import { registerEvents } from "./events/router";

import { discordToken } from "./config";

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerCommands(client);
registerEvents(client);

// Login to the client
client.login(discordToken);
