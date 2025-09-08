import type { NextConfig } from "next";

const PREDICTOR_ORIGIN = "https://wbjee-college-predictor.vercel.app";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "styles.redditmedia.com",
      },
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
      {
        protocol: "https",
        hostname: "b.thumbs.redditmedia.com",
      },
    ],
  },
  async rewrites() {
    return [
      // Serve local static predictor
      {
        source: "/legacy-predictor",
        destination: "/old-predictor/index.html",
      },
      {
        source: "/legacy-predictor/:path*",
        destination: "/old-predictor/:path*",
      },

      

      // Keep API proxied to existing backend
      { source: "/api/:path*", destination: `${PREDICTOR_ORIGIN}/api/:path*` },
    ];
  },
};

export default nextConfig;
