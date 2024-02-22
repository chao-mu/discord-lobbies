// Node
import process from "node:process";

// Load environment variables
import "dotenv/config";

function getValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const discordToken = getValue("DISCORD_TOKEN");
export const applicationId = getValue("APPLICATION_ID");
export const testGuildId = getValue("TEST_GUILD_ID");
