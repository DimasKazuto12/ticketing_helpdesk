import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  eslint: {
    // Ini perintah biar Vercel nggak ngecek ESLint pas build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ini perintah biar Vercel nggak ngecek Type Error pas build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
