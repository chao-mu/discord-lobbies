import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";

migrate(db, { migrationsFolder: "./migrations" })
  .then(() => {
    console.log("Migrations complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error running migrations", err);
    process.exit(1);
  });
