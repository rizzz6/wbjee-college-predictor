import { client, urlFor } from '../../../sanity/client'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { format } from 'date-fns'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Post {
  title: string
  body: PortableTextBlock[]
  mainImage?: SanityImageSource
  publishedAt: string
  author?: { name: string }
}

interface SlugPost {
  slug: { current: string }
}

export async function generateStaticParams() {
  const posts: SlugPost[] = await client.fetch(`*[_type == 'post'] { slug }`)
  return posts.map((post) => ({
    slug: post.slug.current,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      mainImage
    }`,
    { slug }
  )

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const bodyText = post.body?.map(block => block.children?.map(child => 'text' in child ? child.text : '').join('')).join(' ') || ''
  const description = bodyText.substring(0, 150) || post.title

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      images: post.mainImage ? [{ url: urlFor(post.mainImage).width(1200).height(630).url() }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      mainImage,
      publishedAt,
      author->{name}
    }`,
    { slug }
  )

  if (!post) notFound()

  return (
    <div className="px-6 md:px-12 py-12">
      {/* NAVIGATION */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </div>
      <article className="max-w-4xl mx-auto">
        {/* HEADER SECTION */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-4 uppercase tracking-wider">
            {post.publishedAt && format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            {post.author && <span className="text-gray-300 dark:text-gray-700">•</span>}
            {post.author && <span>{post.author.name}</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            {post.title}
          </h1>
        </header>
        {/* HERO IMAGE */}
        {post.mainImage && (
          <div className="relative w-full h-[300px] md:h-[500px] mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={urlFor(post.mainImage).width(1200).height(800).url()}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        {/* CONTENT BODY */}
        {/* prose-red makes links red. prose-lg makes text larger/readable. */}
        <div className="max-w-3xl mx-auto prose prose-lg prose-red dark:prose-invert
          prose-headings:font-bold prose-a:font-semibold
          prose-img:rounded-xl prose-img:shadow-lg">
          <PortableText value={post.body} />
        </div>
        {/* FOOTER DIVIDER */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-gray-500 italic">
            Thanks for reading! Check back for more updates.
          </p>
        </div>
      </article>
    </div>
  )
}