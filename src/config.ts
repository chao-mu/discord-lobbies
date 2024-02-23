// Node
import process from "node:process";

// Load environment variables
import "dotenv/config";

function getStr(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getNumber(name: string): number {
  const value = getStr(name);
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environent variable ${name} is not a number`);
  }

  return parsed;
}

export const discordToken = getStr("DISCORD_TOKEN");
export const applicationId = getStr("APPLICATION_ID");
export const testGuildId = getStr("TEST_GUILD_ID");
export const clientId = getStr("CLIENT_ID");
export const dbHost = getStr("DB_HOST");
export const dbPort = getNumber("DB_PORT");
export const dbUser = getStr("DB_USER");
export const dbPassword = getStr("DB_PASSWORD");
export const dbName = getStr("DB_NAME");
