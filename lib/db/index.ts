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

// Temporary, sanitized auth diagnostics. Never records SQL, parameters, credentials, or cookies.
const originalQuery = pool.query.bind(pool);
pool.query = (async (...args: Parameters<typeof pool.query>) => {
  try {
    return await originalQuery(...args);
  } catch (error) {
    const firstArg = args[0] as unknown as string | { text?: string } | undefined;
    const text = typeof firstArg === "string" ? firstArg : firstArg?.text ?? "unknown query";
    const operation = text.trim().split(/\\s+/).slice(0, 2).join(" ").toUpperCase();
    const details = error instanceof Error ? error : new Error(String(error));
    const diagnostic = { id: `SIGNUP_DIAGNOSTIC_${Date.now().toString(36).toUpperCase()}`, operation, name: details.name, message: details.message.replace(/(password|secret|token|database|host|user)=?[^\\s,;]*/gi, "$1=[redacted]"), stack: details.stack?.split("\\n").slice(0, 4).join("\\n") };
    (globalThis as typeof globalThis & { __gritgridAuthDiagnostic?: typeof diagnostic }).__gritgridAuthDiagnostic = diagnostic;
    console.error("[auth-diagnostic] database error", { id: diagnostic.id, operation: diagnostic.operation, name: diagnostic.name, message: diagnostic.message, stack: diagnostic.stack });
    throw error;
  }
}) as typeof pool.query;

export const db = drizzle(pool, { schema });
