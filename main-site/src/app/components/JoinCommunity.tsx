"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simple counter animation
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, 500); // Delay before starting animation
    
    return () => clearTimeout(timer);
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function JoinCommunity() {
  const [subredditData, setSubredditData] = useState<SubredditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubredditData = async () => {
      try {
        const response = await fetch("/api/subreddit");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubredditData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subreddit data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchSubredditData();
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
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="relative h-32">
            <Image
              src={subredditData?.banner_background_image || "https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png"}
              alt="r/wbjee subreddit community banner - Join the WBJEE discussion community"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-4 md:p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <Image
                src={subredditData?.icon_img || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                alt="r/wbjee subreddit community icon - WBJEE discussion forum"
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