import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  // PROD (your VM / Docker)
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
} else {
  // DEV (Mac / local) - keep using DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set in non-production.");
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export const db = drizzle(pool, { schema });
