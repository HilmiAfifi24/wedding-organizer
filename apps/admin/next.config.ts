import path from "path";
import { fileURLToPath } from "url";

import type { NextConfig } from "next";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  devIndicators: false,
  transpilePackages: ["database"],
  outputFileTracingIncludes: {
    "**/*": ["../../packages/database/generated/prisma/**/*.node"],
  },
};

export default nextConfig;
