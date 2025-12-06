import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse uses some Node.js APIs
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

export default nextConfig;
