import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "*.supabase.co" },
      { hostname: "livekit.io" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "voon.vercel.app",
        "localhost:3000",
        ...(process.env.NEXT_PUBLIC_APP_URL
          ? [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")]
          : []),
      ],
    },
  },
};

export default nextConfig;
