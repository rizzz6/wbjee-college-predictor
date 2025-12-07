import type { Metadata } from "next";
import RankFinderClient from "./RankFinderClient";

export const metadata: Metadata = {
  title: "WBJEE Rank Finder - Find Required Rank for Colleges",
  description: "Find the required WBJEE rank for admission to specific colleges and programs. Browse historical cutoff data, opening and closing ranks for engineering colleges in West Bengal. Get precise rank requirements for Jadavpur University, Calcutta University, and other institutions.",
  keywords: [
    "WBJEE rank finder",
    "WBJEE cutoff rank",
    "college rank requirement",
    "WBJEE opening rank",
    "WBJEE closing rank",
    "engineering college cutoff",
    "WBJEE rank predictor",
    "college admission rank",
    "WBJEE 2025 cutoff",
    "engineering college finder"
  ],
  alternates: {
    canonical: '/rank-finder',
  },
  openGraph: {
    title: "WBJEE Rank Finder - Find Required Rank for Colleges",
    description: "Find the required WBJEE rank for admission to specific colleges and programs. Browse historical cutoff data and rank requirements.",
    url: "https://www.rwbjee.com/rank-finder",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WBJEE Rank Finder - Find required rank for colleges",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WBJEE Rank Finder - Find Required Rank for Colleges",
    description: "Find the required WBJEE rank for admission to specific colleges and programs.",
    images: ["/og-image.svg"],
  },
};

function Hero() {
  return (
    <div className="max-w-4xl mx-auto text-center mb-12 px-6 md:px-12 py-12">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
        Find the <span className="text-red-600">Rank You Need</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
        Select a college and program to see the required rank to get in. Browse historical cutoff data for engineering colleges in West Bengal.
      </p>
    </div>
  );
}

export default function RankFinderPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      <RankFinderClient />
    </div>
  );
}
