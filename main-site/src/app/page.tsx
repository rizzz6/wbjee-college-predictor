"use client";

import { motion, type Variants } from "framer-motion";
import {
  PencilSquareIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import FAQAccordionHome from "./components/FAQAccordionHome";
import JoinCommunity from "./components/JoinCommunity";

function Hero() {
  return (
    <section id="home" className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-white">
            WBJEE College Predictor – Instantly See Your College Options
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-300">
            Instantly discover the engineering and pharmacy colleges you can get into based on your WBJEE 2025 rank using our <a href="/predictor" className="text-red-600 underline hover:text-red-800">College Predictor</a>.
          </p>
          <div className="mt-8">
            <a
              href="/predictor"
              className="inline-flex items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-white font-semibold shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors"
            >
              Predict My College Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const card: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 24 },
    },
  };
  return (
    <section id="about" className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">How It Works</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-300">Three simple steps to get your college predictions.</p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow transition-shadow bg-white dark:bg-gray-900"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-50 dark:bg-gray-800 text-red-600">
              <PencilSquareIcon className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Enter Your Rank</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-300">Provide your General Merit Rank (GMR) and category details.</p>
          </motion.div>

          <motion.div
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow transition-shadow bg-white dark:bg-gray-900"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-50 dark:bg-gray-800 text-red-600">
              <PresentationChartBarIcon className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">View Predictions</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-300">Our algorithm instantly shows you a list of colleges based on previous years&apos; data.</p>
          </motion.div>

          <motion.div
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow transition-shadow bg-white dark:bg-gray-900"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-50 dark:bg-gray-800 text-red-600">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Make a Decision</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-300">Explore your options, filter by stream, and plan your counseling choices.</p>
          </motion.div>
        </div>
        <div className="mt-12 text-center">
          <a
            href="/predictor"
            className="inline-flex items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-white font-semibold shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            Go to Predictor
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      <HowItWorks />
      <JoinCommunity />
      <FAQAccordionHome />

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
            "url": "https://rwbjee.com",
            "logo": "https://rwbjee.com/og-image.svg",
            "description": "Free WBJEE college predictor tool 2025. Find engineering colleges and branches in West Bengal based on your WBJEE rank.",
            "founder": {
              "@type": "Person",
              "name": "rizzz6"
            },
            "sameAs": [
              "https://www.reddit.com/r/wbjee/"
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
            "url": "https://rwbjee.com",
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