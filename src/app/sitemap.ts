import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload-client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.rwbjee.com'

  // 1. Fetch Data from Payload
  const payload = await getPayloadClient()
  
  // Fetch blog posts
  const postRes = await payload.find({
    collection: 'posts',
    limit: 500,
    pagination: false,
  })
  const posts = postRes.docs.map(doc => ({
    slug: doc.slug,
    publishedAt: doc.publishedAt,
  }))

  // Fetch colleges
  const collegeRes = await payload.find({
    collection: 'colleges',
    where: { isVisible: { equals: true } },
    limit: 500,
    pagination: false,
  })
  const colleges = collegeRes.docs.map(doc => ({
    slug: doc.slug,
    _updatedAt: doc.updatedAt,
  }))

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
      url: `${baseUrl}/cutoffs`,
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
  const collegeRoutes: MetadataRoute.Sitemap = colleges.map((college: { slug: string; _updatedAt?: string }) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: new Date(college._updatedAt || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 5. Combine and Return
  return [...staticRoutes, ...blogRoutes, ...collegeRoutes]
}
