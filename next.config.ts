import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // FIX: Disable server optimization in dev to bypass local network IP blocks
    // Temporarily also disabled for local production testing
    unoptimized: true, // Change back to: process.env.NODE_ENV === 'development' for real deployment

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
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/legacy-predictor",
        destination: "/old-predictor/index.html",
      },
      {
        source: "/legacy-predictor/:path*",
        destination: "/old-predictor/:path*",
      },
    ];
  },
};

export default nextConfig;