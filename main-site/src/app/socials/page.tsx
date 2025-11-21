"use client";

import { motion, type Variants } from "framer-motion";
import {
  ChatBubbleLeftIcon,
  UserGroupIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  StarIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import JoinCommunity from "@/app/components/JoinCommunity";


// Custom SVG icons for social media platforms
const RedditIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.01c0-2.592-2.12-4.712-4.752-4.712-1.488 0-2.832.672-3.744 1.68-.864-.384-1.824-.624-2.88-.624-1.056 0-2.016.24-2.88.624-.912-.96-2.256-1.68-3.744-1.68-2.64 0-4.704 2.112-4.704 4.704 0 2.64-.72 3.84 2.64 6.72-.24.48-.24 1.008 0 1.488.432.288.96.48 1.536.48 2.592 0 4.704 2.112 4.704 4.704 0-2.64.72-3.84 2.64-5.28.24-.48.24-1.008 0 1.488-.432-.288-.96-.48-1.536-.48M7.44 13.8c1.44 0 2.64-1.152 2.64-2.64 0-1.44-1.152-2.64-2.64-1.44 0-2.64 1.152-2.64 2.64 0 1.44 1.152 2.64 2.64 1.68 0 2.112-.72 3.84-2.64 5.28-.432.48-.96.672-1.536.672-2.592 0-4.704-2.112-4.704-4.704 0-2.64.72-3.84 2.64-5.28.24-.48.24-1.008 0-1.488-.432-.288-.96-.48-1.536-.48M19.2 9.6c-.48 0-.96.192-1.344.48l-3.6 2.88c-.336.288-.576.672-.672 1.104-.24-.192-.48-.384-.768-.576l-3.6-2.88c-.384-.288-.864-.48-1.344-.48-1.44 0-2.64 1.152-2.64 2.64 0 1.44 1.152 2.64 2.64 1.44 0 2.64-1.152 2.64-2.64 0-1.44-1.152-2.64-2.64M7.44 16.8c.96 0 1.824-.384 2.448-1.008l3.6-2.88c.624-.624 1.008-1.44 1.008-2.448 0-1.44-1.152-2.64-2.64-2.64-1.44 0-2.64 1.152-2.64 2.64 0 1.44 1.152 2.64 2.64 1.44 0 2.64-1.152 2.64-2.64 0-1.008-.624-1.44-1.008-2.448l-3.6-2.88c-.624-.624-1.44-1.008-2.448-1.008z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.496c-1.027-.475-2.14-.81-3.312-1-1.144-.187-2.29-.28-3.41-.28s-2.266.093-3.41.28c-1.172.19-2.285.525-3.312 1-1.027.475-1.953 1.06-2.75 1.732-2.75 1.732v2.88c0 .187.14.336.318.336h3.51c.187 0 .336-.14.336-.336v-2.04c0-.187.093-.336.28-.429s.336-.094.523.094c5.64 1.732 9.99 5.99 9.99 11.466 0 1.57-.84 2.41-1.67 2.41-.83 0-1.17-1.57-2.29-2.76-.7-1.57-.7-3.14 0-6.06-2.88-9.63-6.75-9.63-6.75v-2.58c-1.17.84-2.58 1.41-4.08 1.41-1.67 0-6.895 1.815 4.93 4.93 0 0 0-3.566-1.86c.986 2.428 3.566 4.248 6.694 4.292a4.88 4.88 0 0 0 1.326-.152c.695.209 1.445.375 2.238.493z"/>
  </svg>
);

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
          iconBg: 'bg-indigo-500 text-white',
          title: 'text-gray-800 dark:text-white',
          description: 'text-gray-500 dark:text-gray-400',
          button: 'bg-indigo-500 text-white hover:bg-indigo-600'
        };
      case 'reddit':
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          iconBg: 'bg-orange-500 text-white',
          title: 'text-gray-800 dark:text-white',
          description: 'text-gray-500 dark:text-gray-400',
          button: 'bg-orange-500 text-white hover:bg-orange-600'
        };
      case 'email':
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          iconBg: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          title: 'text-gray-800 dark:text-white',
          description: 'text-gray-500 dark:text-gray-400',
          button: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        };
      default:
        return {
          container: 'rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden',
          iconBg: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          title: 'text-gray-800 dark:text-white',
          description: 'text-gray-500 dark:text-gray-400',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={styles.container}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
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
          {platform.url.startsWith('mailto:') ? (
            <button
              onClick={handleCopyEmail}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex-shrink-0 ${
                copied 
                  ? 'bg-green-500 text-white' 
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
    </motion.div>
  );
}


export default function SocialsPage() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
              Connect With Our Community
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Connect with WBJEE aspirants on Reddit and Discord. Get updates,
              share experiences, and find support throughout your journey to engineering college.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.reddit.com/r/wbjee/"
                target="_blank"
                rel="noreferrer"
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Join r/wbjee
              </a>
              <a
                href="/predictor"
                className="border border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
              >
                Try College Predictor
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Social Platforms */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-8 items-start"
          >
            {/* Primary Community Card */}
            <JoinCommunity />
            
            {/* Discord */}
            <SocialCard
              platform={{
                name: "r/wbjee Discord Server",
                icon: <DiscordIcon />,
                url: "https://discord.gg/pTTKPYryDp",
                description: "Real-time chat with fellow aspirants, study groups, and live Q&A sessions.",
                username: "",
                platformType: "discord",
              }}
            />

            {/* Reddit Profile */}
            <SocialCard
              platform={{
                name: "rizzz6 on Reddit!",
                icon: <RedditIcon />,
                url: "https://reddit.com/u/rizzz6",
                description: "Connect with the creator for direct feedback and suggestions.",
                username: "rizzz6",
                platformType: "reddit",
              }}
            />
            
            {/* Email */}
            <SocialCard
              platform={{
                name: "Email",
                icon: <EnvelopeIcon className="w-6 h-6" />,
                url: "mailto:rizzz6v@gmail.com",
                description: "For formal inquiries, collaborations, and detailed feedback.",
                platformType: "email",
              }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}