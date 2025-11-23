import { MetadataRoute } from 'next'
import { client } from '../sanity/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.rwbjee.com'

  // 1. Fetch Data from Sanity
  const posts = await client.fetch(`*[_type == "post"] { "slug": slug.current, publishedAt }`)
  const colleges = await client.fetch(`*[_type == "college"] { "slug": slug.current }`)

  // 2. Define Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/predictor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rank-finder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // 3. Generate Dynamic Blog URLs
<<<<<<< HEAD
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; publishedAt?: string }) => ({
=======
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
>>>>>>> 82d9d6cd017b40888b33ac8d0cebe5a635c3845c
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 4. Generate Dynamic College URLs
<<<<<<< HEAD
  const collegeRoutes: MetadataRoute.Sitemap = colleges.map((college: { slug: string }) => ({
=======
  const collegeRoutes: MetadataRoute.Sitemap = colleges.map((college: any) => ({
>>>>>>> 82d9d6cd017b40888b33ac8d0cebe5a635c3845c
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 5. Combine and Return
  return [...staticRoutes, ...blogRoutes, ...collegeRoutes]
}
