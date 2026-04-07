import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },

  },

  allowedDevOrigins: [
    'andree-unbedaubed-unmajestically.ngrok-free.dev',
    'localhost:3000'
  ],

};

export default nextConfig;
