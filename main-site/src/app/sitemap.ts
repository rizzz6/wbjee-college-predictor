import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.rwbjee.com'
  const sitemap: MetadataRoute.Sitemap = []

  // Add home page
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })

  // Add legacy predictor
  sitemap.push({
    url: `${baseUrl}/old-predictor`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })

  // Automatically discover Next.js pages
  const appDir = path.join(process.cwd(), 'src/app')

  function scanPages(dir: string, currentPath = '') {
    try {
      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          // Skip API routes and components
          if (item === 'api' || item === 'components' || item.startsWith('_') || item.startsWith('.')) {
            continue
          }

          // Check if this directory has a page.tsx or page.js
          const pageFile = path.join(fullPath, 'page.tsx')
          const pageFileJS = path.join(fullPath, 'page.js')

          if (fs.existsSync(pageFile) || fs.existsSync(pageFileJS)) {
            const pageUrl = currentPath ? `${currentPath}/${item}` : `/${item}`

            // Set priority based on page type
            let priority = 0.7
            let changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'monthly'

            if (item === 'predictor' || item === 'rank-finder') {
              priority = 0.9
              changeFrequency = 'weekly'
            } else if (item === 'disclaimer' || item === 'privacy') {
              priority = 0.4
              changeFrequency = 'yearly'
            } else if (item === 'faq') {
              priority = 0.6
              changeFrequency = 'monthly'
            }

            sitemap.push({
              url: `${baseUrl}${pageUrl}`,
              lastModified: new Date(),
              changeFrequency,
              priority,
            })
          }

          // Recursively scan subdirectories
          scanPages(fullPath, currentPath ? `${currentPath}/${item}` : `/${item}`)
        }
      }
    } catch (error) {
      console.error('Error scanning pages:', error)
    }
  }

  // Scan the app directory for pages
  scanPages(appDir)

  // Add static pages from public directory
  const publicDir = path.join(process.cwd(), 'public')

  try {
    const publicItems = fs.readdirSync(publicDir)

    for (const item of publicItems) {
      if (item.endsWith('.html') && item !== 'index.html') {
        const pageName = item.replace('.html', '')
        sitemap.push({
          url: `${baseUrl}/${pageName}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch (error) {
    console.error('Error scanning public directory:', error)
  }

  // Sort by priority (highest first)
  return sitemap.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
