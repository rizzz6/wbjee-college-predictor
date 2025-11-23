"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useSWR from 'swr'


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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JoinCommunity() {
  const { data: subredditData, error, isLoading } = useSWR('/api/subreddit', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 600000,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-800 animate-pulse">
          <div className="relative h-32 bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800"></div>
              <div className="ml-4 flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
        <p className="text-red-500">Error loading subreddit data: {error}</p>
      </div>
    );
  }

  if (!subredditData) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
        <div className="relative h-32">
          <Image
            src={subredditData?.banner_background_image || "https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png"}
            alt="r/wbjee subreddit community banner - Join the WBJEE discussion community"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-4 md:p-6">
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
  );
}