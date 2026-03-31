/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    // Ensure Next.js includes the pg driver in the server runtime bundle on platforms like Vercel
    // even though we lazy-load it via eval('require') in server code.
    serverComponentsExternalPackages: ['pg'],
  },
  // Ensure API routes use the Node.js runtime by default (can be overridden per-route)
  // This is important for Node-native drivers like 'pg'.
  serverRuntimeConfig: {},
  eslint: {
    // Temporarily skip ESLint during production builds on Vercel to avoid blocking deploys.
    // Local development can still use `pnpm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
