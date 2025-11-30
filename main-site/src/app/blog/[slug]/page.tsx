import { client, urlFor } from '../../../sanity/client';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { format } from 'date-fns';
// FIX: Added extra icons for the new design
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';

export const revalidate = 60;

interface Post {
  title: string;
  body: any[];
  mainImage?: SanityImageSource;
  publishedAt: string;
  author?: { name: string };
}

// Styled Components for Rich Text
const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-gray-900 dark:text-white leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-red-500 pl-6 py-2 my-8 bg-red-50 dark:bg-red-900/10 rounded-r-lg italic text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          className="text-red-600 hover:text-red-800 dark:text-red-400 underline decoration-red-200 dark:decoration-red-900 underline-offset-4 transition-colors font-medium"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2 text-lg">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2 text-lg">{children}</ol>,
  },
};

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == 'post'] { slug }`);
  return posts.map((post: { slug: { current: string } }) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      mainImage
    }`,
    { slug }
  );

  if (!post) {
    return { title: 'Post Not Found', robots: { index: false } };
  }

  const bodyText = post.body
    ?.filter(block => block._type === 'block' && block.children)
    .map(block => block.children.map((child: any) => child.text).join(''))
    .join(' ') || '';

  const description = bodyText.substring(0, 155) + (bodyText.length > 155 ? '...' : '') || post.title;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      images: post.mainImage ? [{ url: urlFor(post.mainImage).width(1200).height(630).url() }] : [],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      mainImage,
      publishedAt,
      author->{name}
    }`,
    { slug }
  );

  if (!post) notFound();

  return (
    <article className="bg-white dark:bg-gray-900 pb-8 relative selection:bg-red-100 selection:text-red-900 dark:selection:bg-red-900/30 dark:selection:text-red-100">

      {/* --- BACKGROUND DECORATION (Adds depth) --- */}
      <div className="absolute inset-x-0 top-0 h-[600px] -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/60 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.3]" />
        {/* Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />
      </div>

      {/* --- STICKY NAV BAR --- */}
      <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-16 z-20 transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-16">

        {/* --- HEADER SECTION --- */}
        <header className="mb-10 text-center">

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-6">
            {post.publishedAt && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
                <Calendar className="w-4 h-4 text-red-500" />
                <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</time>
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
                <User className="w-4 h-4 text-blue-500" />
                <span>{post.author.name}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6 drop-shadow-sm">
            {post.title}
          </h1>
        </header>

        {/* --- HERO IMAGE --- */}
        {post.mainImage && (
          <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10">
            <Image
              src={urlFor(post.mainImage).width(1200).height(675).url()}
              alt={post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
        )}

        {/* --- CONTENT BODY --- */}
        <div className="max-w-none">
          <PortableText value={post.body} components={ptComponents} />
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 text-sm font-medium">
            <Share2 className="w-4 h-4" />
            Found this helpful? Share it with fellow aspirants!
          </div>
        </div>
      </div>
    </article>
  );
}