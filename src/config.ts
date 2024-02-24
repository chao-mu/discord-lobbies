// Zod
import { z } from "zod";

// Node
import process from "process";

// DotEnv
import "dotenv/config";

const configSchema = z.object({
  discordToken: z.string(),
  applicationId: z.string(),
  testGuildId: z.string(),
  clientId: z.string(),
  dbHost: z.string(),
  dbPort: z.coerce.number(),
  dbUser: z.string(),
  dbPassword: z.string(),
  dbName: z.string(),
});

export const config = configSchema.parse({
  discordToken: process.env.DISCORD_TOKEN,
  applicationId: process.env.APPLICATION_ID,
  testGuildId: process.env.TEST_GUILD_ID,
  clientId: process.env.CLIENT_ID,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
});
