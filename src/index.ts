// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import {
  getCommands,
  registerCommands,
  deployCommands,
} from "./discord/commands";
import { getEventHandlers, registerEvents } from "./discord/events";
import { config } from "./config";

(async () => {
  // Initialize the client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  const commands = await getCommands();
  registerCommands(commands, client);

  const eventHandlers = getEventHandlers();
  registerEvents(eventHandlers, client);

  deployCommands(commands, config.testGuildId);

  // Login to the client
  await client.login(config.discordToken);
})();
