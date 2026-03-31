// lib/db.ts  — server-only, do not import from client components
import { Pool, neonConfig } from '@neondatabase/serverless';

// Improves connection reuse across serverless function invocations
neonConfig.fetchConnectionCache = true;

// Singleton pool — reused across hot-reloads in dev and across invocations in prod
declare global {
    // eslint-disable-next-line no-var
    var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set. Add it to .env.local or Vercel environment variables.');
    }

    if (!globalThis.__pgPool) {
        globalThis.__pgPool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    return globalThis.__pgPool;
}

export async function ensureSchema(): Promise<void> {
    const pool = getPool();
    const sql = `
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id            BIGSERIAL PRIMARY KEY,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      visit_date    DATE,
      age_group     TEXT,
      sections      JSONB,
      summary       JSONB,
      open          JSONB,
      raw           JSONB NOT NULL
    );
  `;
    await pool.query(sql);
}