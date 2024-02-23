// Discord.js
import { Client, GatewayIntentBits } from "discord.js";

// Ours
import { loadCommands, registerCommands, deployCommands } from "./commands";
import { getEventHandlers, registerEvents } from "./events";
import config from "./config";

(async () => {
  const commands = await loadCommands();
  const eventHandlers = getEventHandlers();

  // Initialize the client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  registerCommands(commands, client);
  registerEvents(eventHandlers, client);

  deployCommands(commands, config.testGuildId);

  // Login to the client
  await client.login(config.discordToken);
})();
