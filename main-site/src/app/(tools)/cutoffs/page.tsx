import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import CutoffFinderClient from "./CutoffFinderClient";

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
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WBJEE Cutoffs - Find required cutoff ranks for colleges",
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

export default function CutoffsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      <CutoffFinderClient />
    </div>
  );
}
