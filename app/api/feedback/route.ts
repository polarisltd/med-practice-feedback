import { NextRequest } from 'next/server';
import { ensureSchema, getPool } from '@/lib/db';

export const dynamic = 'force-dynamic'; // ensure this runs server-side only
export const runtime = 'edge'; // Neon serverless driver supports Edge runtime

function isValidLikert(n: unknown): boolean {
  return typeof n === 'number' && [1,2,3,4,5].includes(n as number);
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const rid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  try {
    const body = await req.json();

    // Basic validation
    if (!body || typeof body !== 'object') {
      console.warn(`[${rid}] Invalid body type`, { typeofBody: typeof body });
      return Response.json({ error: 'Nepareizs pieprasījums' }, { status: 400 });
    }

    const { date, ageGroup, sections, summary, open } = body as {
      date?: string;
      ageGroup?: string;
      sections?: any;
      summary?: { overall?: number | null; recommend?: string | '' };
      open?: any;
    };

    // Require at least these fields based on UI logic
    if (!date || !summary || summary.overall == null || summary.recommend == null || summary.recommend === '') {
      console.warn(`[${rid}] Missing required fields`, { date: !!date, hasSummary: !!summary, overall: summary?.overall, recommend: summary?.recommend });
      return Response.json({ error: 'Trūkst obligātie lauki' }, { status: 400 });
    }

    if (!isValidLikert(summary.overall)) {
      console.warn(`[${rid}] Invalid overall score`, { value: summary.overall });
      return Response.json({ error: 'Nepareiza kopējā vērtējuma vērtība' }, { status: 400 });
    }

    // If no DB configured (e.g., after a fresh runtime restart without env), accept submission without persisting.
    if (!process.env.DATABASE_URL) {
      console.info(`[${rid}] No DATABASE_URL set, accepting without persistence`);
      return Response.json({ ok: true, id: 0, createdAt: new Date().toISOString(), note: 'No DATABASE_URL set' });
    }

    // Persist to DB
    console.info(`[${rid}] Ensuring schema and inserting`, { hasSections: !!sections, hasOpen: !!open, env: process.env.NODE_ENV });
    await ensureSchema();
    const pool = getPool();

    const insertSql = `
      INSERT INTO feedback_submissions (visit_date, age_group, sections, summary, open, raw)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb)
      RETURNING id, created_at
    `;

    const normalizedAgeGroup = (typeof ageGroup === 'string' && ageGroup.trim() === '') ? null : (ageGroup ?? null);

    const params = [
      date, // visit_date
      normalizedAgeGroup, // age_group
      sections ?? {},
      summary ?? {},
      open ?? {},
      body,
    ];

    const result = await pool.query(insertSql, params);

    const ms = Date.now() - startedAt;
    console.info(`[${rid}] Inserted feedback`, { id: result.rows[0].id, ms });
    return Response.json({ ok: true, id: result.rows[0].id, createdAt: result.rows[0].created_at });
  } catch (err: any) {
    const ms = Date.now() - startedAt;
    // Log rich error info for debugging
    console.error(`[${rid}] POST /api/feedback error after ${ms}ms`, {
      message: err?.message,
      code: err?.code,
      detail: err?.detail,
      stack: err?.stack,
    });
    // Surface validation-style JSON parse errors
    if (err?.type === 'invalid-json') {
      return Response.json({ error: 'Nederīgs JSON' }, { status: 400 });
    }
    const isProd = process.env.NODE_ENV === 'production';
    return Response.json({ error: isProd ? 'Iekšēja servera kļūda' : `Iekšēja servera kļūda: ${err?.message || 'unknown error'}` }, { status: 500 });
  }
}
