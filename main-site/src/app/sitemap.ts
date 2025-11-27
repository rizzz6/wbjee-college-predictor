import { MetadataRoute } from 'next'
import { client } from '../sanity/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.rwbjee.com'

  // 1. Fetch Data from Sanity
  const posts = await client.fetch(`*[_type == "post"] { "slug": slug.current, publishedAt }`)
  const colleges = await client.fetch(`*[_type == "college" && isVisible == true] { "slug": slug.current }`)

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
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/socials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legacy-predictor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  // 3. Generate Dynamic Blog URLs
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; publishedAt?: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 4. Generate Dynamic College URLs
  const collegeRoutes: MetadataRoute.Sitemap = colleges.map((college: { slug: string }) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 5. Combine and Return
  return [...staticRoutes, ...blogRoutes, ...collegeRoutes]
}
