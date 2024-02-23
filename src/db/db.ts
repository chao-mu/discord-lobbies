import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "@/config";

import * as schema from "./schema";

const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
