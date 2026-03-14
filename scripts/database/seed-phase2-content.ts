import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'
import fs from 'fs'
import readline from 'readline'
import fetch from 'node-fetch'
import { toHTML } from '@portabletext/to-html'

import { sanitizeRichHtml } from '../../src/utils/sanitize-rich-html'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function run() {
  const { default: config } = await import('../../payload.config')
  const payload = await getPayload({ config })
  
  const ndjsonPath = path.join(process.cwd(), 'rwbjee-dataset-export-2026-03-05t21-32-27-990z/data.ndjson')
  const fileStream = fs.createReadStream(ndjsonPath)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  console.log('🚀 Starting Phase 2 Migration (Posts, Timeline, Settings)...')

  let postsCount = 0
  let timelineCount = 0
  let settingsMigrated = false

  for await (const line of rl) {
    if (!line.trim()) continue
    const doc = JSON.parse(line)

    // 1. BLOG POSTS
    if (doc._type === 'post') {
      try {
        let mediaId = null

        // Handle Main Image (if exists)
        if (doc.mainImage?.asset?._ref) {
          const assetId = doc.mainImage.asset._ref.replace('image-', '').replace(/-([^-]*)$/, '.$1')
          const imageUrl = `https://cdn.sanity.io/images/ytfxpldt/rwbjee-dataset/${assetId}`

          try {
            const response = await fetch(imageUrl)
            const buffer = await response.buffer()

            const mediaDoc = await payload.create({
              collection: 'media',
              data: { alt: doc.title },
              file: {
                data: buffer,
                name: `${doc.slug?.current || doc._id}.png`,
                mimetype: 'image/png',
                size: buffer.length,
              },
            })
            mediaId = mediaDoc.id
          } catch (imgErr) {
            console.warn(`⚠️ Warning: Failed to migrate image for ${doc.title}:`, imgErr instanceof Error ? imgErr.message : String(imgErr))
          }
        }

        // Convert PortableText to HTML and sanitize it before storage.
        const bodyHtml = sanitizeRichHtml(toHTML(doc.body || []))
        
        // Create excerpt (first 160 chars of plain text)
        const plainText = (doc.body || [])
          .filter((block: { _type: string, children?: unknown[] }) => block._type === 'block' && block.children)
          .map((block: { children: Array<{ text: string }> }) => block.children.map((child: { text: string }) => child.text).join(''))
          .join(' ')
        const excerpt = plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '')

        await payload.create({
          collection: 'posts',
          data: {
            title: doc.title,
            slug: doc.slug?.current || `post-${doc._id}`,
            publishedAt: doc.publishedAt,
            mainImage: mediaId,
            author: {
              name: doc.author?.name || 'rwbjee Team',
            },
            tags: doc.tags || [],
            bodyHtml,
            excerpt: excerpt,
            sanityId: doc._id,
          },
        })
        postsCount++
        console.log(`✅ Post: ${doc.title}`)
      } catch (err) {
        console.error(`❌ Failed Post ${doc.title}:`, err instanceof Error ? err.message : String(err))
      }
    }

    // 2. TIMELINE
    if (doc._type === 'timeline') {
      try {
        await payload.create({
          collection: 'timeline',
          data: {
            title: doc.title,
            date: doc.date,
            isTentative: doc.isTentative || false,
            sanityId: doc._id,
          },
        })
        timelineCount++
        console.log(`✅ Event: ${doc.title}`)
      } catch (err) {
        console.error(`❌ Failed Event ${doc.title}:`, err instanceof Error ? err.message : String(err))
      }
    }

    // 3. SITE SETTINGS
    if (doc._type === 'siteSettings') {
      try {
        const announcement = doc.announcement || {}
        await payload.updateGlobal({
          slug: 'site-settings',
          data: {
            announcement: {
              enabled: announcement.enabled || false,
              message: announcement.message || '',
              linkUrl: announcement.linkUrl || '',
              linkText: announcement.linkText || '',
              variant: announcement.variant || 'info',
            },
          },
        })
        settingsMigrated = true
        console.log(`✅ Settings: Announcement migrated`)
      } catch (err) {
        console.error(`❌ Failed Settings:`, err instanceof Error ? err.message : String(err))
      }
    }
  }

  console.log('\n✨ Migration Complete!')
  console.log(`📊 Posts: ${postsCount}`)
  console.log(`📊 Timeline Events: ${timelineCount}`)
  console.log(`📊 Settings: ${settingsMigrated ? 'Yes' : 'No'}`)
  
  process.exit(0)
}

run()
