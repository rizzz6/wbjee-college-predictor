import { client, urlFor } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Post {
  title: string
  body: any[]
  mainImage?: any
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

  const bodyText = (post.body as any[])?.map(block => (block as any).children?.map((child: any) => child.text || '').join('')).join(' ') || ''
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
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
    notFound()
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        </header>

        {post.mainImage && (
          <div className="mb-8">
            <Image
              src={urlFor(post.mainImage).width(800).url()}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <PortableText value={post.body} />
        </div>
      </article>
    </div>
  )
}