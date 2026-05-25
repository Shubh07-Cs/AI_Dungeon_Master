


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/AI_Dungeon_Master",
  assetPrefix: "/AI_Dungeon_Master/",
};

export default nextConfig;