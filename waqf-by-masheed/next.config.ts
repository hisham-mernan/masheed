import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so proxy.ts and env files resolve from THIS
  // project, not the parent D:/Masheed monorepo root (multiple lockfiles).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
