import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import { PageHero } from "@/components/layout/PageHero";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Dynamic imports for true code splitting
// Mobile devices will never download DesktopCutoffFinder code
// Desktop devices will never download MobileCutoffFinder code
const MobileCutoffFinder = dynamic(() => import('./MobileCutoffFinder'), {
  loading: () => <div className="flex justify-center py-12">Loading...</div>
});

const DesktopCutoffFinder = dynamic(() => import('./DesktopCutoffFinder'), {
  loading: () => <div className="flex justify-center py-12">Loading...</div>
});

export const metadata: Metadata = {
  title: "WBJEE Opening & Closing Ranks (OR-CR) | Previous Year Cutoff Search",
  description: "Search official WBJEE cutoffs (OR-CR) from 2023-2024. Filter by college, branch, and category to analyze trends for WBJEE 2026 admission.",
  alternates: {
    canonical: '/cutoffs',
  },
  openGraph: {
    title: "WBJEE Cutoff Search Tool - Check Previous Year OR-CR",
    description: "Analyze cutoff trends for Jadavpur, Calcutta University, and more. Search 2023-2024 opening & closing ranks by category.",
    url: "https://www.rwbjee.com/cutoffs",
    siteName: "rwbjee",
    images: [
      {
        url: "/assets/tools/cutoffs-og.png",
        width: 1200,
        height: 630,
        alt: "WBJEE Cutoffs - Find required cutoff ranks for engineering colleges",
      },
    ],
    type: "website",
  },
};

function Hero() {
  return (
    <PageHero
      title={{ main: 'Cutoff', accent: 'Search' }}
      description="Select a college and program to see the required cutoff ranks. Browse historical opening and closing ranks for engineering colleges in West Bengal."
    />
  );
}

export default async function CutoffsPage() {
  const headersList = await headers();
  const deviceType = headersList.get('x-device-type');
  const isMobile = deviceType === 'mobile';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />

      {/* Server-side fork with dynamic imports for true code splitting */}
      <Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
        <ErrorBoundary>
          {isMobile ? (
            <MobileCutoffFinder />
          ) : (
            <DesktopCutoffFinder />
          )}
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
