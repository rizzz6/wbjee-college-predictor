import Image from "next/image";
import { Users } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

interface JoinCommunityProps {
  showHeader?: boolean;
}

async function fetchSubredditData() {
  const fallbackData = {
    name: 'wbjee',
    icon_img: 'https://styles.redditmedia.com/t5_910ggt/styles/communityIcon_2hpHGZf1d9R8e5R3cG5W5.png',
    display_name_prefixed: 'r/wbjee',
    subscribers: 1500,
    public_description: 'Join the discussion about WBJEE, college predictions, and engineering admissions in West Bengal!',
    banner_background_image: 'https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png',
    display_name: 'wbjee'
  };

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwqQ3kiymWa7tsFye46OG-3P-GaLufOgW6XFV-9ZdlmNQg6YszHqh47NLvCYsb2SJ0/exec",
      {
        next: { revalidate: 28800 } // 8 hours ISR
      }
    );

    const responseText = await response.text();
    const responseData = JSON.parse(responseText);
    const data = responseData.success ? responseData.data : responseData;

    return {
      ...fallbackData,
      ...data,
      icon_img: (data.icon_img || data.community_icon)?.split('?')[0] || fallbackData.icon_img,
      banner_background_image: data.banner_background_image?.split('?')[0] || fallbackData.banner_background_image,
      subscribers: data.subscribers || data.accounts_active || fallbackData.subscribers,
      public_description: data.public_description || data.description || fallbackData.public_description,
      display_name_prefixed: data.display_name_prefixed || `r/${data.display_name || 'wbjee'}`,
      display_name: data.display_name || data.name || 'wbjee',
      name: data.name || 'wbjee'
    };
  } catch (error) {
    console.error("Error fetching subreddit:", error);
    return fallbackData;
  }
}

export default async function JoinCommunity({ showHeader = false }: JoinCommunityProps) {
  const subredditData = await fetchSubredditData();

  return (
    <div className="w-full">
      {showHeader && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          Join the Community <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </h2>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
        <div className="relative h-32">
          <Image
            src={subredditData.banner_background_image}
            alt="r/wbjee subreddit community banner - Join the WBJEE discussion community"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center">
            <Image
              src={subredditData.icon_img}
              alt="r/wbjee subreddit community icon - WBJEE discussion forum"
              className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800"
              width={64}
              height={64}
            />
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {subredditData.display_name_prefixed}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mt-1">
                {subredditData.public_description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-4">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">
                  <AnimatedCounter value={subredditData.subscribers} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
              </div>
            </div>
            <a
              href={`https://www.reddit.com/${subredditData.display_name_prefixed}`}
              target="_blank"
              rel="noreferrer"
              className="bg-orange-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-700 transition-colors border-2 border-orange-700 hover:border-orange-800 shadow-md"
            >
              Join
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
