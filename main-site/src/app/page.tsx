import Link from "next/link";
import JoinCommunity from "./components/JoinCommunity";
import ImportantDates from "./components/ImportantDates";
import FeaturedColleges from "./components/FeaturedColleges";
import FAQAccordionHome from "./components/FAQAccordionHome";
import { client } from "../sanity/client";
import { Users } from 'lucide-react';
import { motion } from "framer-motion";
import { Pencil, BarChart3, CheckCircle2 } from "lucide-react";
import HowItWorks from "./components/HowItWorks";

function Hero() {
  return (
    <section id="home" className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-white">
            WBJEE College Predictor – Instantly See Your College Options
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-300">
            Instantly discover the engineering and pharmacy colleges you can get into based on your WBJEE 2025 rank using our <Link href="/predictor" className="text-red-600 underline hover:text-red-800">College Predictor</Link>.
          </p>
          <div className="mt-8">
            <Link
              href="/predictor"
              className="inline-flex items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-white font-semibold shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors"
            >
              Predict My College Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


export default async function Page() {
  const featuredColleges = await client.fetch(`
    *[_type == "college" && priority == 1 && isVisible == true][0...4] | order(name asc) {
      _id, name, slug, logo, location, shortName
    }
  `);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      
      {/* Introduction Section */}
      <HowItWorks />
      
      {/* ✅ SPACER WRAPPER
         This div adds the gap (space-y-24) and ensures consistent alignment 
      */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20 md:space-y-24">
        <ImportantDates 
          limit={3} 
          showViewAll={true} 
        />
        
        <FeaturedColleges colleges={featuredColleges} />
      </div>

      {/* Combined FAQ + Community Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        {/* FIX: Increased gap-8 to 'gap-12 md:gap-16' for more breathing room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Left: FAQ */}
          <div className="w-full">
            <FAQAccordionHome />
          </div>

          {/* Right: Reddit Widget */}
          <div className="w-full sticky top-24">
            <JoinCommunity showHeader={true} />
          </div>

        </div>
      </div>

      {/* Structured Data for SEO */}
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

      {/* Organization structured data */}
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

      {/* WebApplication structured data */}
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