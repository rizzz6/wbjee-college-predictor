import { client, urlFor } from '../../../sanity/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';
import { FileText, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: SanityImageSource;
}

export const metadata: Metadata = {
  title: "WBJEE Prep Blog | Latest Updates & Strategies",
  description: "Essential guides, exam analysis, and strategy tips for every WBJEE aspirant. Stay updated with the latest news and expert advice.",
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: "WBJEE Prep Blog - r/wbjee Companion",
    description: "Expert guides and latest updates for WBJEE aspirants.",
    url: "https://www.rwbjee.com/blog",
    type: "website",
  }
};

export default async function BlogPage() {
  const posts: Post[] = await client.fetch(`*[_type == 'post'] | order(publishedAt desc) { _id, title, slug, publishedAt, mainImage }`);

  return (
    /* FIX: Added 'min-h-screen' and explicit 'bg-white dark:bg-gray-900' to force correct theme background */
    <div className="min-h-screen bg-white dark:bg-gray-900 px-6 md:px-12 py-12">

      <div className="max-w-7xl mx-auto mb-16 text-center">
        {/* FIX: Updated colors for Accessibility (Contrast Ratio) */}
        <div className="inline-block p-2 px-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium mb-4">
          {`From the Editor's Desk`}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Latest <span className="text-red-600">Updates</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Essential guides, exam analysis, and strategy tips for every WBJEE aspirant.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {post.mainImage ? (
                    <Image
                      src={urlFor(post.mainImage).width(800).height(500).url()}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-gray-800">
                      <FileText className="w-20 h-20 text-red-300 dark:text-red-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col flex-1 p-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Recent'}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {post.title}
                  </h2>

                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No posts published yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Check back soon for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}