"use client";

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion";
import { Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FaDiscord, FaReddit } from "react-icons/fa";

interface SocialPlatform {
  name: string;
  icon: React.ReactNode | React.ReactElement;
  url: string;
  description: string;
  username?: string;
  followers?: number;
  isPrimary?: boolean;
  platformType?: 'discord' | 'reddit' | 'email' | 'generic';
}

function SocialCard({ platform }: { platform: SocialPlatform }) {
  const [copied, setCopied] = useState(false);

  const getPlatformStyles = () => {
    switch (platform.platformType) {
      case 'discord':
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          title: 'text-gray-800 dark:text-white',
          // FIX: Darkened text for accessibility
          description: 'text-gray-600 dark:text-gray-400',
          button: 'bg-indigo-600 text-white hover:bg-indigo-700'
        };
      case 'reddit':
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          title: 'text-gray-800 dark:text-white',
          // FIX: Darkened text for accessibility
          description: 'text-gray-600 dark:text-gray-400',
          // FIX: Changed orange-500 to orange-600 for better contrast
          button: 'bg-orange-600 text-white hover:bg-orange-700'
        };
      case 'email':
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          iconBg: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          title: 'text-gray-800 dark:text-white',
          // FIX: Darkened text for accessibility
          description: 'text-gray-600 dark:text-gray-400',
          button: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        };
      default:
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          iconBg: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          title: 'text-gray-800 dark:text-white',
          description: 'text-gray-600 dark:text-gray-400',
          button: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        };
    }
  };

  const handleCopyEmail = async () => {
    if (platform.url.startsWith('mailto:')) {
      const email = platform.url.replace('mailto:', '');
      try {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    }
  };

  const styles = getPlatformStyles();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={styles.container}
    >
      <div className="p-3 h-full">
        <div className="flex items-center justify-between gap-4 h-full">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className={`rounded-lg`}>
                {platform.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${styles.title} truncate`}>
                {platform.name}
              </h3>
              {platform.url.startsWith('mailto:') ? (
                <p className={`text-xs ${styles.description} truncate`}>
                  {platform.url.replace('mailto:', '')}
                </p>
              ) : platform.username ? (
                <span className={`text-xs ${styles.description}`}>
                  u/{platform.username}
                </span>
              ) : null}
            </div>
          </div>
          {platform.url.startsWith('mailto:') ? (
            <button
              onClick={handleCopyEmail}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex-shrink-0 ${copied
                ? 'bg-green-600 text-white' // Darkened green for consistency
                : styles.button
                }`}
            >
              {copied ? 'Copied!' : 'Copy Email'}
            </button>
          ) : (
            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${styles.button} flex-shrink-0`}
            >
              {platform.platformType === 'discord' ? 'Join Server' : 'Visit'}
            </a>
          )}
        </div>
      </div>
    </m.div>
  );
}

export default function SocialsClient({ children }: { children?: ReactNode }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                Connect With Our Community
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Connect with WBJEE aspirants on Reddit and Discord. Get updates,
                share experiences, and find support throughout your journey to engineering college.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.reddit.com/r/wbjee/"
                  target="_blank"
                  rel="noreferrer"
                  /* FIX: Changed red-500 to red-600 for contrast */
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Join r/wbjee
                </a>
                <a
                  href="/predictor"
                  /* FIX: Changed red-500 to red-600 for contrast */
                  className="border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
                >
                  Try College Predictor
                </a>
              </div>
            </m.div>
          </div>
        </section>

        {/* Dynamic Social Platforms */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <m.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {/* Primary Community Card */}
              <div className="w-full">
                {children}
              </div>

              {/* Other Social Links */}
              <div className="flex flex-wrap gap-8 justify-center">
                <SocialCard
                  platform={{
                    name: "r/wbjee Discord Server",
                    icon: <FaDiscord className="w-8 h-8 text-[#5865F2]" />,
                    url: "https://discord.gg/pTTKPYryDp",
                    description: "Real-time chat with fellow aspirants, study groups, and live Q&A sessions.",
                    username: "",
                    platformType: "discord",
                  }}
                />

                <SocialCard
                  platform={{
                    name: "rizzz6 on Reddit!",
                    icon: <FaReddit className="w-8 h-8 text-[#FF4500]" />,
                    url: "https://reddit.com/u/rizzz6",
                    description: "Connect with the creator for direct feedback and suggestions.",
                    username: "rizzz6",
                    platformType: "reddit",
                  }}
                />

                <SocialCard
                  platform={{
                    name: "Email",
                    icon: <Mail className="w-6 h-6" />,
                    url: "mailto:rizzz6v@gmail.com",
                    description: "For formal inquiries, collaborations, and detailed feedback.",
                    platformType: "email",
                  }}
                />
              </div>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}