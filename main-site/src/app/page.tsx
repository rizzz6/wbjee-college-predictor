"use client";

import { useState, useEffect, useRef } from "react";
import { motion, type Variants, useInView, animate } from "framer-motion";
import Image from "next/image";
import {
  PencilSquareIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";




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
            See Your WBJEE College Options, Instantly.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-300">
            Instantly discover the engineering and pharmacy colleges you can get into based on your WBJEE 2025 rank.
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
            <p className="mt-2 text-gray-500 dark:text-gray-300">Our algorithm instantly shows you a list of colleges based on previous years&#39; data.</p>
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

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        onUpdate: (latest) => {
          setCount(Math.round(latest));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

interface SubredditData {
  name: string;
  icon_img: string;
  banner: string;
  banner_background_image: string;
  header_img: string;
  subscribers: number;
  active_user_count: number;
  public_description: string;
  display_name: string;
  display_name_prefixed: string;
}


function JoinCommunity() {
  const [subredditData, setSubredditData] = useState<SubredditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reddit-data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSubredditData(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Reddit subreddit data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <p className="text-gray-500 dark:text-gray-300">Loading subreddit data...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <p className="text-red-500">Error loading subreddit data: {error}</p>
        </div>
      </section>
    );
  }

  if (!subredditData) {
    return null; // Or a message indicating no data
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="relative h-32">
            <Image
              src={subredditData?.banner_background_image.split('?')[0] || "https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png"}
              alt="Subreddit Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-4 md:p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <Image
                src={subredditData?.icon_img ? subredditData.icon_img.split('?')[0] : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                alt="Subreddit Icon"
                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800"
                width={64}
                height={64}
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{subredditData?.display_name_prefixed || 'r/wbjee'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{subredditData?.public_description || 'Join the discussion!'}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white"><AnimatedCounter value={subredditData?.subscribers || 0} /></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white"><AnimatedCounter value={subredditData?.active_user_count || 0} /></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
              <a
                href={`https://www.reddit.com/${subredditData?.display_name_prefixed || 'r/wbjee'}`}
          target="_blank"
                rel="noreferrer"
                className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold"
              >
                Join
              </a>
            </div>
          </div>
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
      
    </div>
  );
}
