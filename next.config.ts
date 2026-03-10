import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: Moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: [
    "jsdom",
    "isomorphic-dompurify",
    // Payload CMS dependencies that must not be bundled by webpack
    "@libsql",
    "drizzle-kit",
    "payload",
    "@payloadcms/db-postgres",
  ],
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

  // Dev performance optimizations
  experimental: {
    // Faster dev server
    optimizePackageImports: ['lucide-react'],
  },
};

import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload(nextConfig);
