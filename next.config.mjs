/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    // Temporarily skip ESLint during production builds on Vercel to avoid blocking deploys.
    // Local development can still use `pnpm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
