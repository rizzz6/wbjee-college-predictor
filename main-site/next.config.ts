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
    ],
  },
  async redirects() {
    return [
      // Redirect non-www to www (preferred canonical domain)
      {
        source: '/(.*)',
        destination: 'https://www.rwbjee.com/$1',
        permanent: true,
      },
    ];
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
    ];
  },
};

export default nextConfig;
