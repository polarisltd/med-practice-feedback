# Troubleshooting Feedback Submission Errors

If the form shows “Neizdevās nosūtīt anketu: Iekšēja servera kļūda”, use this guide to capture details and resolve the issue.

What the API logs now include
- Each /api/feedback request gets a request ID (rid), e.g. [a1b2c3].
- Logs for key steps: validation, schema ensure, DB insert, and timings.
- On errors we log message, code, detail, and stack.
- In non‑production (local dev), the API response includes the actual error message after the colon; in production the message stays generic, but logs have full details.

Where to view logs
- Local development: check the terminal where you run `npm run dev` or `pnpm dev` after submitting the form. Look for lines like:
  - `[rid] Ensuring schema and inserting`
  - `[rid] Inserted feedback { id: ..., ms: ... }`
  - `[rid] POST /api/feedback error after ...ms { message, code, detail, stack }`
- Hosted (e.g., Vercel): open Function Logs for the project and filter for `/api/feedback` around your submission time. The same `[rid]` pattern appears.

What to provide when reporting a failure
- The full on‑screen error message (in dev it includes details).
- The matching server log lines for that request, including the `[rid]` and timestamp.
- Environment (local dev vs production) and approximate time of the attempt.

Quick checks
- DATABASE_URL must be set in the environment for persistence. If missing, the API accepts the submission without saving and returns `{ note: 'No DATABASE_URL set' }` in dev.
- Postgres/Neon connectivity: current config enables SSL with `rejectUnauthorized:false`, which is suitable for Neon’s pooler. Ensure the database URL is correct and reachable from the runtime.
- Required fields: the API returns 400 if any of the mandatory fields are missing or invalid: `date`, `summary.overall` (1–5), and `summary.recommend` (Ja|Varbūt|Nē).

Next steps to debug
1) Reproduce the error by submitting the form.
2) Capture the on‑screen error and corresponding server logs with `[rid]`.
3) Use the details (error message/code/detail) to identify if it’s a DB connectivity, permission, schema, or casting issue and address accordingly.
