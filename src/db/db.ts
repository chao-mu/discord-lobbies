import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbHost, dbPort, dbUser, dbPassword, dbName } from "@/config";

import * as schema from "./schema";

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

export const db = drizzle(pool, { schema });

export type DB = typeof db & { rollback: () => void };
