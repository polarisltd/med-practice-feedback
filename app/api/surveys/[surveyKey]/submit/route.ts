import { NextRequest } from 'next/server';
import { ensureSchema, getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function toNumeric(v: unknown): number | null {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
  return null;
}

export async function POST(req: NextRequest, ctx: { params: { surveyKey: string } }) {
  const startedAt = Date.now();
  const rid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const surveyKey = ctx.params?.surveyKey;
  try {
    if (!surveyKey) {
      return Response.json({ error: 'Missing survey key' }, { status: 400 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Nepareizs pieprasījums' }, { status: 400 });
    }

    const { answers, meta } = body as { answers?: any[]; meta?: Record<string, any> };
    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: 'Trūkst atbilžu' }, { status: 400 });
    }

    // No DB configured — accept submission but do not persist.
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: true, id: 0, createdAt: new Date().toISOString(), note: 'No DATABASE_URL set' });
    }

    await ensureSchema();
    const pool = getPool();

    // Insert response record
    const insertRespSql = `
      INSERT INTO survey_responses (survey_key, meta, raw)
      VALUES ($1, $2::jsonb, $3::jsonb)
      RETURNING id, created_at
    `;
    const respRes = await pool.query(insertRespSql, [surveyKey, meta ?? {}, body]);
    const responseId = respRes.rows[0].id as number;

    // Prepare normalized answer rows
    // Row: survey_key, response_id, question_id, question_text, numeric, text, option, json
    type Row = [string, number, string, string | null, number | null, string | null, string | null, any | null];
    const rows: Row[] = [];

    for (const a of answers) {
      const qid: string = String(a?.id ?? '').trim();
      if (!qid) continue;
      const type: string = String(a?.type ?? '').trim().toLowerCase();
      const qtext: string | null = a?.questionText ? String(a.questionText) : null;

      if (type === 'likert' || type === 'number' || type === 'scale') {
        rows.push([surveyKey, responseId, qid, qtext, toNumeric(a?.value), null, null, null]);
      } else if (type === 'single' || type === 'radio' || type === 'option') {
        const v = a?.value;
        if (v && typeof v === 'object' && 'code' in v && 'text' in v) {
          const codeNum = toNumeric((v as any).code);
          const textVal = String((v as any).text);
          const optKey = 'key' in (v as any) && (v as any).key != null ? String((v as any).key) : textVal;
          rows.push([surveyKey, responseId, qid, qtext, codeNum, textVal, optKey, null]);
        } else {
          const val = v == null ? null : String(v);
          rows.push([surveyKey, responseId, qid, qtext, toNumeric(val), val, val, null]);
        }
      } else if (type === 'multi' || type === 'checkboxes' || type === 'multiple') {
        const arr = Array.isArray(a?.value) ? a.value : [];
        for (const opt of arr) {
          if (opt && typeof opt === 'object' && 'code' in opt && 'text' in opt) {
            const codeNum = toNumeric((opt as any).code);
            const textVal = String((opt as any).text);
            const optKey = 'key' in (opt as any) && (opt as any).key != null ? String((opt as any).key) : textVal;
            rows.push([surveyKey, responseId, qid, qtext, codeNum, textVal, optKey, null]);
          } else {
            const optStr = String(opt);
            rows.push([surveyKey, responseId, qid, qtext, toNumeric(optStr), optStr, optStr, null]);
          }
        }
      } else if (type === 'text' || type === 'open' || type === 'comment') {
        const txt = a?.value == null ? null : String(a.value);
        rows.push([surveyKey, responseId, qid, qtext, null, txt, null, null]);
      } else {
        // Fallback to JSON
        rows.push([surveyKey, responseId, qid, qtext, null, null, null, a?.value ?? null]);
      }
    }

    if (rows.length > 0) {
      const insertAnsSql = `
        INSERT INTO survey_answer_items
          (survey_key, response_id, question_id, question_text, answer_value_numeric, answer_value_text, answer_value_option, answer_json)
        VALUES ${rows.map((_, i) => `($${i*8+1}, $${i*8+2}, $${i*8+3}, $${i*8+4}, $${i*8+5}, $${i*8+6}, $${i*8+7}, $${i*8+8})`).join(',')}
      `;
      const flatParams = rows.flat();
      await pool.query(insertAnsSql, flatParams as any[]);
    }

    const ms = Date.now() - startedAt;
    console.info(`[${rid}] Inserted survey ${surveyKey}`, { responseId, ms, answers: rows.length });
    return Response.json({ ok: true, id: responseId, createdAt: respRes.rows[0].created_at });
  } catch (err: any) {
    const ms = Date.now() - startedAt;
    console.error(`[${rid}] POST /api/surveys/${surveyKey}/submit error after ${ms}ms`, {
      message: err?.message,
      code: err?.code,
      detail: err?.detail,
      stack: err?.stack,
    });
    const isProd = process.env.NODE_ENV === 'production';
    return Response.json({ error: isProd ? 'Iekšēja servera kļūda' : `Iekšēja servera kļūda: ${err?.message || 'unknown'}` }, { status: 500 });
  }
}
