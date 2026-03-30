// Lazy-load pg in a way that avoids build-time resolution by Next.js when it's not available.
// We purposefully avoid a static import to prevent "Module not found: Can't resolve 'pg'" during
// client/edge analyses. This file is server-only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalWithPool = global as any as { __pgPool?: any };

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it to your environment (.env.local).');
  }
  if (!globalWithPool.__pgPool) {
    // Use eval('require') to avoid static analysis bundling
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let pg: typeof import('pg');
    try {
      pg = eval('require')('pg') as typeof import('pg');
    } catch (e: any) {
      const pm = process.env.npm_config_user_agent?.includes('pnpm') ? 'pnpm install' : 'npm install';
      throw new Error(
        `Postgres driver 'pg' is not installed or cannot be resolved. Please run '${pm}' in the project directory and restart the dev server. Original error: ${e?.message || e}`
      );
    }
    globalWithPool.__pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      // Neon requires SSL. The provided URL includes sslmode=require; this flag ensures TLS in pg too.
      ssl: { rejectUnauthorized: false },
      // With Neon pooler host, it's fine to use pg Pool in serverless functions.
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalWithPool.__pgPool as any;
}

export async function ensureSchema() {
  const pool = getPool();
  // Create a table to store the feedback if it doesn't exist yet.
  // We keep columns for simple querying and also store full raw JSON.
  const sql = `
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      visit_date DATE,
      age_group TEXT,
      sections JSONB,
      summary JSONB,
      open JSONB,
      raw JSONB NOT NULL
    );
  `;
  await pool.query(sql);
}
