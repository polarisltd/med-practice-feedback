import { NextResponse } from 'next/server';

// Capture build time at bundle eval so it represents the built artifact, not request time
const buildTime = new Date().toISOString();

export async function GET() {
  const data = {
    app: {
      name: 'abprakse-feedback-form',
      version: process.env.npm_package_version || null,
    },
    git: {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null,
      commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      repoOwner: process.env.VERCEL_GIT_REPO_OWNER || null,
      repoSlug: process.env.VERCEL_GIT_REPO_SLUG || null,
    },
    vercel: {
      env: process.env.VERCEL_ENV || (process.env.VERCEL ? 'production' : 'local'),
      deploymentUrl: process.env.VERCEL_URL || null,
      isVercel: !!process.env.VERCEL,
    },
    buildTime,
    now: new Date().toISOString(),
  } as const;

  const res = NextResponse.json(data);
  // Disable caching so you always see fresh metadata
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}
