export const revalidate = 60;

import Link from "next/link";
import { Suspense } from "react";
import ImportantDates from "./components/ImportantDates";
import FeaturedColleges from "./components/FeaturedColleges";
import { client } from "../sanity/client";
import dynamic from 'next/dynamic';
const HowItWorks = dynamic(() => import('./components/HowItWorks'));
const JoinCommunity = dynamic(() => import('./components/JoinCommunity'));
const FAQWidget = dynamic(() => import('./components/FAQWidget'));

// Define Homepage FAQ Data
const homeFAQData = [
  {
    q: "Is this the official WBJEE site?",
    a: (
      <>
        No, this is a free community resource. For official updates, always visit{" "}
        <a href="https://wbjeeb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-800">wbjeeb.nic.in</a>.
      </>
    ),
  },
  {
    q: "How accurate is the predictor?",
    a: "It uses previous years' cutoff data (2023-2024) to estimate chances. While highly accurate for trends, actual cutoffs vary every year.",
  },
  {
    q: "Is the college data up to date?",
    a: "Yes, we have updated the fees and placement stats for the 2024-2025 session based on the latest available reports.",
  },
];


{/* ... Hero, HowItWorks, ImportantDates, FeaturedColleges ... */ }


// --- Components ---

function Hero() {
  return (
    <section id="home" className="relative isolate">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white to-white dark:from-transparent dark:via-gray-900 dark:to-gray-900" />
      <div className="absolute inset-0 -z-10 bg-grid-pattern" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">

          {/* ⚡️ OPTIMIZED: Static class list. No animation. 
              Lighthouse will see this instantly. */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-white">
            WBJEE College Predictor – Instantly See Your College Options
          </h1>

          {/* ✨ ANIMATED: This fades in 200ms later. 
              Since it's not the LCP element, it doesn't hurt your score! */}
          <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-200 animate-fade-in-up animation-delay-200">
            Instantly discover the engineering and pharmacy colleges you can get into based on your WBJEE 2025 rank using our <Link href="/predictor" className="text-red-600 underline hover:text-red-800">College Predictor</Link>.
          </p>

          <div className="mt-8 animate-fade-in-up animation-delay-400">
            <Link
              href="/predictor"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-red-700 active:bg-red-800 transition-colors"
            >
              Predict My College Now
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

// 3. New Async Component: Handles data fetching separately
async function FeaturedCollegesSection() {
  const featuredColleges = await client.fetch(`
          *[_type == "college" && priority == 1 && isVisible == true][0...4] | order(name asc) {
            _id, name, slug, logo, location, shortName
          }
          `);

  return <FeaturedColleges colleges={featuredColleges} />;
}

// 4. Loading State for the colleges (prevents layout shift)
function FeaturedCollegesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-80 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

// --- Main Page ---

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* HERO LOADS INSTANTLY NOW (No 'await' blocking it) */}
      <Hero />

      <HowItWorks />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20 md:space-y-24">
        <ImportantDates
          limit={3}
          showViewAll={true}
        />

        {/* 5. Suspense Boundary: This loads in background while user reads the Hero */}
        <Suspense fallback={<FeaturedCollegesSkeleton />}>
          <FeaturedCollegesSection />
        </Suspense>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div className="w-full">
            <FAQWidget
              data={homeFAQData}
              footer={
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                >
                  View All FAQs <span aria-hidden="true">→</span>
                </Link>
              }
            />
          </div>
          <div className="w-full sticky top-24">
            <JoinCommunity showHeader={true} />
          </div>
        </div>
      </div>

      {/* SEO Data (Kept as is) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is this the official WBJEE site?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, this is not the official WBJEE website. For official information, visit wbjeeb.nic.in."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the predictor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The predictor uses previous years' data to estimate your probable rank or college. Actual results may vary. Use it as a guide, not a guarantee."
                }
              }
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WBJEE College Predictor",
            "url": "https://www.rwbjee.com",
            "logo": "https://www.rwbjee.com/og-image.svg",
            "description": "Free WBJEE college predictor tool 2025. Find engineering colleges and branches in West Bengal based on your WBJEE rank.",
            "founder": {
              "@type": "Person",
              "name": "rizzz6"
            },
            "sameAs": [
              "https://www.reddit.com/r/wbjee/",
              "https://discord.gg/wbjee-community",
              "https://reddit.com/u/rizzz6"
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "WBJEE College Predictor",
            "url": "https://www.rwbjee.com",
            "description": "Free WBJEE college predictor tool to find colleges and branches based on your rank",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": [
              "College prediction based on WBJEE rank",
              "Branch-wise cutoff analysis",
              "Historical trend analysis",
              "Filter by college, branch, category",
              "Export results to CSV",
              "Mobile responsive design"
            ]
          })
        }}
      />
    </div>
  );
}