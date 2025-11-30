import type { NextConfig } from "next";

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
      // FIX: Added Sanity CDN to allow loading college logos
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Removed problematic redirect rule that caused infinite redirects
  // Domain redirects should be handled at CDN/load balancer level
  // to avoid infinite redirect loops
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
    ];
  },
};

export default nextConfig;