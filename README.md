# abprakse-feedback-form

A Next.js 14 project (TypeScript, App Router) with Tailwind CSS and ESLint.

Direct links
- Run locally and open the updated survey wizard: http://localhost:3000/surveys/feedback1
- Submit endpoint used by the wizard: POST http://localhost:3000/api/surveys/feedback1/submit
- Root page (legacy simple form): http://localhost:3000/

Notes about location:
- You asked for the project under `~/workspace`. Due to the execution environment, I created it inside the current repository at:
  `/Users/robertsp/workspace/spain-agtech-website/spain-agtech-website/abprakse-feedback-form`.
- You can move it later to `~/workspace` by copying this folder:
  `cp -R /Users/robertsp/workspace/spain-agtech-website/spain-agtech-website/abprakse-feedback-form ~/workspace/`

## Getting Started

1. Configure environment
   - Copy `.env.example` to `.env.local` and adjust the DATABASE_URL if needed.
     ```bash
     cp .env.example .env.local
     ```
   - The provided DATABASE_URL points to your Neon Postgres and includes sslmode=require and channel_binding.

2. Install dependencies
   - Using npm (default):
     ```bash
     npm install
     ```
   - Recommended: pnpm for faster/efficient installs (optional):
     ```bash
     corepack enable
     pnpm install
     pnpm dev
     ```

3. Run the development server
   ```bash
   npm run dev
   # or: pnpm dev / yarn dev / bun dev
   ```
   Open http://localhost:3000 in your browser.

3. Lint
   ```bash
   npm run lint
   ```

4. Build and start
   ```bash
   npm run build
   npm start
   ```

## Tech Stack and Choices
- Next.js 14 with the App Router
- TypeScript enabled
- Tailwind CSS preconfigured
- ESLint with `next/core-web-vitals`

## What are Next.js, React.js, and Node.js?

- React.js
  - What it is: A JavaScript library for building user interfaces, created by Facebook. React focuses on the "view" layer. You compose UIs from components with declarative JSX and manage state/props.
  - Where it runs: In the browser (client-side) by default. It can also render on the server when paired with frameworks like Next.js.
  - What it solves: Building complex, interactive UI components and managing UI state efficiently with a virtual DOM.

- Node.js
  - What it is: A JavaScript runtime built on Chrome's V8 engine that lets you run JS outside the browser (on servers, CLIs, scripts).
  - Where it runs: On the server or any machine as a runtime. Enables building web servers, APIs, CLIs, background jobs, etc.
  - What it solves: Server-side logic in JS, accessing file system/network, handling HTTP requests, connecting to databases.

- Next.js
  - What it is: A React framework for production. It adds routing, data fetching, server-side rendering (SSR), static site generation (SSG), API routes, edge/serverless support, image optimization, and more.
  - Where it runs: Both server (Node.js or edge/serverless runtimes) and client (browser). Next.js decides what code runs where.
  - What it solves: Full-stack React apps with great DX and performance out of the box: file-based routing, pre-rendering, streaming, caching, and deployment primitives.

How they relate in this project
- React provides the component model for the UI.
- Next.js (built on React) structures the app (routing in the app/ directory), decides rendering strategy (SSR/SSG/CSR), and exposes server capabilities (e.g., Route Handlers, Server Actions).
- Node.js is the runtime Vercel/your machine uses to execute Next.js' server code (e.g., API routes) and build steps. Our DB code in lib/db.ts runs on the server runtime, not in the browser.

When to use which
- Use React when you only need a UI library to embed in an existing stack or a microfrontend, and you will manage build, routing, and data fetching yourself.
- Use Node.js when writing server-side programs/APIs/CLIs in JavaScript or TypeScript.
- Use Next.js when building a production React app or site that benefits from routing, SSR/SSG, server components, API routes, and seamless deployment.

Notes specific to this repo
- We use Next.js 14 App Router with React 18. Many components can be Server Components by default, improving performance. "use client" marks Client Components when interactivity/state/hooks are required.
- Database access via @neondatabase/serverless happens on the server only (never import lib/db.ts into client components). Node.js executes this code in serverless/edge functions during requests.

## Deploying to Vercel

These are the recommended steps to deploy this Next.js app to Vercel.

Note: This project’s Vercel config disables ESLint during production builds to avoid deployments being blocked by lint errors. Local dev can still use `pnpm run lint`. See `next.config.mjs` (eslint.ignoreDuringBuilds=true).

Prerequisites
- A GitHub, GitLab, or Bitbucket repository containing this project
- A Vercel account (https://vercel.com/signup)
- Your DATABASE_URL ready (Neon/Postgres). Use a pooled connection string and SSL.

Option A — Deploy via Git (recommended)
1) Push code to a Git repository
   - Initialize (if not already):
     git init && git add . && git commit -m "Initial commit"
   - Create a new repo on GitHub (or GitLab/Bitbucket) and push:
     git branch -M main
     git remote add origin <YOUR_REPO_URL>
     git push -u origin main

2) Import the project in Vercel
   - Go to vercel.com/new and select your repo
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: repository root (this folder)

3) Configure Environment Variables
   - Add DATABASE_URL with your Postgres connection string
   - If using Neon, ensure it includes sslmode=require
   - You can also add any other variables you need from .env.example

4) Build & Deploy
   - Build Command: next build (default)
   - Output: handled by Next.js on Vercel (no change needed)
   - Click Deploy. The first deployment may take a couple of minutes.

5) Verify
   - Open the deployed URL
   - Submit the feedback form to ensure the /api/feedback route works
   - If it fails, check Vercel → Project → Deployments → View Functions Logs

Option B — Deploy with Vercel CLI (alternative)
1) Install CLI
   - npm i -g vercel
   - vercel login

2) Link and deploy
   - From the project folder: vercel
   - Follow prompts to create/link the project
   - When prompted, add DATABASE_URL as a Production/Preview Environment Variable
   - For a production deployment: vercel --prod

Environment variables management
- In Vercel dashboard: Settings → Environment Variables → Add DATABASE_URL
- For local dev using Vercel envs: vercel env pull .env.local
- Any time you update env vars in Vercel, trigger a rebuild/redeploy

Database notes (Neon/Postgres)
- Prefer a pooled connection string; Neon’s pooler works well with serverless
- SSL must be enabled (sslmode=require). The code already supports SSL.
- No static IP allowlists are required for Vercel outbound connections

Regions
- For best latency, choose a Vercel region close to your database region when creating the project (or use a geo-close region via Project → Settings → Functions → Regions if applicable)

Logs & debugging on Vercel
- Use Project → Deployments → View Function Logs
- Filter for /api/feedback and look for the request ID [rid] in logs, as described below in this README

Custom domains
- Add a domain in Vercel: Project → Settings → Domains → Add
- Set it as the Production domain to point your main URL to the latest production deployment

Common pitfalls
- Missing DATABASE_URL → API may accept locally but won’t persist; in production you’ll see generic error unless you check logs
- Mismatched env between Preview and Production → make sure both have DATABASE_URL
- Uninstalled dependencies → Vercel installs from package.json; ensure pg is listed (it is)

## API
- POST /api/feedback
  - Body: The full feedback JSON sent by the form on the home page. At minimum requires: `{ date: string (YYYY-MM-DD), summary: { overall: 1|2|3|4|5, recommend: 'Ja'|'Varbūt'|'Nē' } }`
  - Response: `{ ok: true, id: number, createdAt: string }` or an error JSON with 400/500.

- GET /api/version
  - Returns build metadata to verify what’s deployed on Vercel.
  - Sample fields: `{ app: { name, version }, git: { commitSha, shortSha, commitMessage, branch, repoUrl }, vercel: { env, deploymentUrl, isVercel }, buildTime, now }`.
  - In Vercel, commitSha/shortSha and branch are populated from Vercel Git env vars. Use this to confirm the deployment picked up the latest commit.

## Moving to ~/workspace and Git Init
- To relocate:
  ```bash
  cp -R /Users/robertsp/workspace/spain-agtech-website/spain-agtech-website/abprakse-feedback-form ~/workspace/
  ```
- Initialize git inside the new directory (if desired):
  ```bash
  cd ~/workspace/abprakse-feedback-form
  git init
  git add .
  git commit -m "Initial Next.js app scaffold"
  ```

## Feedback form
The home page contains a minimal feedback form that POSTs to `/api/feedback`.
You can wire this to a database or email service later as needed.


## Troubleshooting: Submission errors and server logs

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


## Running, stopping, and restarting the app

Which command to use in terminal
- Development: use one of the following (they are equivalent for this project):
  - npm run dev
  - pnpm dev
  - npx next dev
  Recommendation: pick the package manager you installed deps with (npm or pnpm) and use its dev script, e.g. pnpm dev.

- Production (local or server):
  - npm run build
  - npm start

How to stop the dev server
- In the same terminal where it is running, press Ctrl + C
  - macOS/Linux: Ctrl + C
  - Windows (Command Prompt/PowerShell): Ctrl + C, then confirm if asked

How to restart
- Simple restart: stop with Ctrl + C, then start again with npm run dev or pnpm dev
- Hot reload: during development, file changes trigger automatic reloads; a full restart is only needed if env vars or dependencies changed

If port 3000 is stuck (process didn’t stop cleanly)
- macOS/Linux:
  - Find the PID: lsof -i :3000
  - Kill it: kill -9 <PID>
  - Alternative (one-liner): npx kill-port 3000
- Windows (PowerShell/CMD):
  - Find the PID: netstat -ano | findstr :3000
  - Kill it: taskkill /PID <PID> /F

Environment variables
- If you change .env.local, you must restart the dev server to pick up the new values

Notes
- pnpm dev runs next dev through the script in package.json; using next dev directly is fine, but scripts keep things consistent across environments
- For long-running production processes, consider a process manager (pm2, systemd, Docker) to handle restarts automatically


## Fixing "Cannot find module 'pg'" during form submit

If you see the error “Iekšēja servera kļūda: Cannot find module 'pg'” when submitting the form:
- Ensure dependencies are installed in this project folder:
  - cd /Users/robertsp/workspace/abprakse-feedback-form
  - npm install  (or: pnpm install)
- Restart the dev server after installing: npm run dev (or pnpm dev)
- Make sure you are running the app from this folder, not a parent or different workspace path.
- If the error persists, remove and reinstall modules:
  - rm -rf node_modules .next
  - npm install  (or: pnpm install)

With the latest code, the server will also show a clearer message suggesting to install 'pg' if it is missing.


## Neon on serverless platforms (Vertex/Vercel/etc.)

This project now supports writing to Neon Postgres even when the native `pg` driver cannot be loaded (a common constraint on some serverless platforms like Google Cloud Vertex AI Extensions / Functions).

How it works:
- At runtime, the server code first tries to load the standard `pg` driver.
- If `pg` is unavailable, it transparently falls back to the Neon serverless driver `@neondatabase/serverless`, which speaks HTTP/WebSocket and is optimized for serverless function runtimes.
- No code changes are required in your routes: the same pool interface is used under the hood.

What you need to provide:
- Set `DATABASE_URL` to your Neon connection string. Prefer a pooled connection string and include `sslmode=require`.
- Ensure the dependency `@neondatabase/serverless` is installed (it's now included in package.json).

Notes:
- If both drivers are missing, the API will accept feedback but skip persistence, returning a note in the JSON response. Check your logs and install one of the drivers.
- Using `@neondatabase/serverless` avoids native bindings and typically works in restricted environments where `pg` cannot be resolved.
- Neon also offers a REST-like SQL over HTTP capability via this package; a separate bespoke REST API is not required for simple inserts.


## New Survey Wizard (feedback1)

Latest updates (J8K block)
- Implemented six sub-questions under the J8K umbrella to capture whether patients received necessary information when booking an ambulatory service.
- Question IDs: J8K_1, J8K_2, J8K_3, J8K_4, J8K_5, J8K_6.
- Each uses a standardized 6-option scale with English lexeme keys for analytics (see Standardized answer scale below).
- UI file: app/surveys/feedback1/page.tsx
- Try it: http://localhost:3000/surveys/feedback1

Newly added blocks (same 6-option scale)
- J10K: Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību — questions J10K_1..J10K_5.
- J11K: Jūsu viedoklis par veselības aprūpes pakalpojuma saņemšanu — questions J11K_1..J11K_4.
- J13K: Vai personāls izturējās ar cieņu? — questions J13K_1..J13K_4 (Ārsti, Māsas/ārsta palīgi/vecmātes, Funkcionālie speciālisti, Citi darbinieki).
- J14K11A: Vai Jūs pietiekami iesaistīja lēmumu pieņemšanā par Jūsu veselības aprūpes procesu?
- J15K12A: Vai uz uzdotajiem jautājumiem Jūs saņēmāt saprotamas atbildes?
- J17K14A: Saprotamā veidā par zālēm — questions J17K14A_1..J17K14A_4.
- J19K16A: Saprotama informācija par diagnozi un turpmāko aprūpi — questions J19K16A_1..J19K16A_4.

We added a second feedback form as a step-by-step (wizard) experience and store its results in separate, analyzable tables.

- URL: /surveys/feedback1
- Backend endpoint: POST /api/surveys/feedback1/submit
- Purpose: One question per screen; stores normalized answers allowing counts and averages per question.

Notes
- The current surveyDefinition in app/surveys/feedback1/page.tsx is a placeholder until we receive the exact questions from the PDF. The final question id is set to J29K26A.
- Once you provide the full list of questions and their types/options, replace the surveyDefinition with the real content. No backend change is required.

Database schema (auto-created if missing)
- survey_responses: one row per wizard submission.
  - id BIGSERIAL PK, created_at, survey_key, meta JSONB, raw JSONB
- survey_answer_items: one row per question (or selected option for multi-select) for each response.
  - id BIGSERIAL PK
  - survey_key TEXT, response_id BIGINT (FK to survey_responses)
  - question_id TEXT
  - answer_value_numeric DOUBLE PRECISION (for Likert/scale/numbers)
  - answer_value_text TEXT (for free text)
  - answer_value_option TEXT (for option labels/values)
  - answer_json JSONB (fallback)
  - created_at TIMESTAMPTZ
  - Indexed by (survey_key, question_id) and by numeric/option for fast aggregation

Example payload
```
POST /api/surveys/feedback1/submit
{
  "meta": { "submittedAt": "2026-04-06T21:00:00Z" },
  "answers": [
    { "id": "Q1", "type": "likert", "value": 5 },
    { "id": "Q2", "type": "single", "value": { "code": 1, "text": "Ja", "key": "yes" } },
    { "id": "J8K_1", "type": "single", "value": { "code": 2, "text": "Drīzāk jā", "key": "rather_yes" } },
    { "id": "J8K_2", "type": "single", "value": { "code": 3, "text": "Drīzāk nē", "key": "rather_no" } },
    { "id": "Q3", "type": "likert", "value": 4 },
    { "id": "Q4", "type": "text", "value": "Ātra uzņemšana" },
    { "id": "Q5", "type": "comment", "value": "Vairāk stāvvietu" },
    { "id": "J29K26A", "type": "text", "value": "Paldies!" }
  ]
}
```

Standardized answer scale
- yes_info_scale (used by J8K_*):
  - 1 Jā -> key: yes
  - 2 Drīzāk jā -> key: rather_yes
  - 3 Drīzāk nē -> key: rather_no
  - 4 Nē -> key: no
  - 5 Nevēlos atbildēt -> key: prefer_not_to_answer
  - 6 Neattiecas -> key: not_applicable

Persistence details
- For single/multi option answers, answer_value_option stores the English key (e.g., rather_yes), answer_value_text stores the Latvian label, and answer_value_numeric stores the numeric code when provided.

Example SQL for analysis
- Count responses per option (single choice):
```
SELECT question_id, answer_value_option AS option, COUNT(*) AS cnt
FROM survey_answer_items
WHERE survey_key = 'feedback1' AND question_id = 'Q2'
GROUP BY question_id, answer_value_option
ORDER BY cnt DESC;
```
- Average rating per question (Likert 1–5):
```
SELECT question_id, AVG(answer_value_numeric) AS avg_score, COUNT(*) AS responses
FROM survey_answer_items
WHERE survey_key = 'feedback1' AND question_id IN ('Q1','Q3')
GROUP BY question_id
ORDER BY question_id;
```
- Overall averages for all numeric questions:
```
SELECT question_id,
       AVG(answer_value_numeric) AS avg_score,
       MIN(answer_value_numeric) AS min_score,
       MAX(answer_value_numeric) AS max_score,
       COUNT(*) AS responses
FROM survey_answer_items
WHERE survey_key = 'feedback1' AND answer_value_numeric IS NOT NULL
GROUP BY question_id
ORDER BY question_id;
```

How to customize
- Edit app/surveys/feedback1/page.tsx and update surveyDefinition with exact questions from the PDF (types: likert, single, multi, text, number, etc.).
- The API is generic and will normalize values based on the provided type. No changes needed unless new answer types are introduced.
- If you want a separate path/key, duplicate the page under app/surveys/<newKey>/page.tsx and post to /api/surveys/<newKey>/submit. Use the same schema for analytics.
