import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbHost, dbPort, dbUser, dbPassword, dbName } from "../config";

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

export const db = drizzle(pool);

export type Transaction = typeof db & { rollback: () => void };
