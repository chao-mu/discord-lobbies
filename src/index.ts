// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import { registerCommands, deployCommands } from "./commands/router";
import { registerEvents } from "./events/router";
import { discordToken, testGuildId } from "./config";

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerCommands(client);
registerEvents(client);
deployCommands(testGuildId);

// Login to the client
client.login(discordToken);
