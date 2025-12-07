import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse uses some Node.js APIs
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
