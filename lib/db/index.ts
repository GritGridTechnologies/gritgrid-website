import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED;

const pgConfig: PoolConfig = connectionString
  ? { connectionString, max: 5 }
  : {
      host: process.env.PGHOST ?? process.env.POSTGRES_HOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER ?? process.env.POSTGRES_USER,
      password: process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD,
      database: process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE,
      ssl: { rejectUnauthorized: false },
      max: 5,
    };

if (!pgConfig.connectionString && (!pgConfig.host || !pgConfig.user || !pgConfig.password || !pgConfig.database)) {
  throw new Error("Neon database configuration is missing. Set DATABASE_URL or the Vercel Postgres PG* variables.");
}

export const pool = new Pool(pgConfig);

export const db = drizzle(pool, { schema });
