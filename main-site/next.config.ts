import type { NextConfig } from "next";

const PREDICTOR_ORIGIN = "https://wbjee-college-predictor.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve local static predictor
      { source: "/predictor", destination: "/predictor/index.html" },

      // Keep API proxied to existing backend
      { source: "/api/:path*", destination: `${PREDICTOR_ORIGIN}/api/:path*` },
    ];
  },
};

export default nextConfig;
