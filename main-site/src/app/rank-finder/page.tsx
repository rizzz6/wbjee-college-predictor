import type { Metadata } from "next";

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
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-white">
            Find the Rank You Need
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-300">
            Select a college and program to see the required rank to get in.
          </p>
        </div>
      </div>
    </section>
  );
}

function RankFinder() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rank Finder functionality is being optimized. Please use the main predictor tool for now.
          </p>
          <a 
            href="/predictor" 
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Predictor
          </a>
        </div>
      </div>
    </section>
  );
}

export default function RankFinderPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      <RankFinder />
    </div>
  );
}
