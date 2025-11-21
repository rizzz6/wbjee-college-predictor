import { client } from '../../sanity/client'
import Link from 'next/link'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
}

export default async function Page() {
  const posts: Post[] = await client.fetch(`*[_type == 'post'] | order(publishedAt desc) { _id, title, slug, publishedAt }`)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`} className="block">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600">{new Date(post.publishedAt).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}