// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import { getCommands, registerCommands, deployCommands } from "./commands";

import { getEventHandlers, registerEvents } from "./events";

import { discordToken, testGuildId } from "./config";

const commands = getCommands();
const eventHandlers = getEventHandlers();

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerCommands(commands, client);
registerEvents(eventHandlers, client);

deployCommands(commands, testGuildId);

// Login to the client
client.login(discordToken);
