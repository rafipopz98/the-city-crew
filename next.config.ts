import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // all https domains
      },
      {
        protocol: "http",
        hostname: "**", // optional, only if some sources use http
      },
    ],
  },
};

export default nextConfig;
