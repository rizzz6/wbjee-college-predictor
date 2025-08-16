"use client";

import { useState, useEffect, useRef } from "react";
import { motion, type Variants, useInView, animate } from "framer-motion";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  PencilSquareIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useAppTheme } from "./providers";

function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <a href="#home" className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            r/wbjee Companion
          </a>

          <nav className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-200">
            <a href="#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</a>
            <a href="#about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">About</a>
            <a href="#contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact</a>
            <a
              href="https://www.reddit.com/u/rizzz6"
            target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              <span className="text-gray-700 dark:text-gray-200">Contact u/rizzz6</span>
            </a>
            <ThemeToggle />
          </nav>

          <button
            aria-label="Toggle navigation"
            className="md:hidden p-2 rounded border border-gray-200 dark:border-gray-700"
            onClick={() => setOpen(v => !v)}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-200">
              <a href="#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Home</a>
              <a href="#about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>About</a>
              <a href="#contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Contact</a>
              <a
                href="https://www.reddit.com/u/rizzz6"
          target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(false)}
              >
                <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                <span>Contact u/rizzz6</span>
              </a>
              <ThemeToggle />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

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

  useEffect(() => {
    fetch("https://www.reddit.com/r/wbjee/about.json")
      .then((response) => response.json())
      .then((data) => {
        setSubredditData(data.data);
      })
      .catch((error) => {
        console.error("Error fetching Reddit subreddit data:", error);
      });
  }, []);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div>
            <img
              src={subredditData?.banner_background_image.split('?')[0] || "https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png"}
              alt="Subreddit Banner"
              className="w-full h-32 object-cover"
            />
          </div>
          <div className="p-4 md:p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <img
                src={subredditData?.icon_img.split('?')[0] || "https://styles.redditmedia.com/t5_910ggt/styles/communityIcon_t8j2nugd23j71.png"}
                alt="Subreddit Icon"
                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800"
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



function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 dark:text-gray-300">
            © 2025 r/wbjee Companion. Built by{' '}
            <a
              href="https://www.reddit.com/u/rizzz6"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              u/rizzz6
            </a>
            .
          </div>
          <div className="flex items-center gap-6 text-gray-700 dark:text-gray-200">
            <a href="/privacy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</a>
            <a href="/disclaimer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Disclaimer</a>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            For any queries or suggestions, feel free to reach out on Reddit.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">#Aazadi</p>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <JoinCommunity />
      <Footer />
    </div>
  );
}
