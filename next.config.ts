import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
