import { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

import {
  convertHtmlToRichText,
  getPayloadEditorConfig,
} from '@/utils/payload-richtext'
import { calculateReadingTime, extractLexicalMetadata } from '@/utils/lexical-metadata'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
    group: 'Content',
    preview: (doc, { token }) => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
      return `${serverUrl}/api/preview?url=/blog/${doc.slug}&token=${token}`
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      revalidateCollection((doc) => {
        const d = doc as { slug: string }
        return ['/blog', `/blog/${d.slug}`, '/']
      }),
    ],
    afterDelete: [
      revalidateCollection((doc) => {
        const d = doc as { slug: string }
        return ['/blog', `/blog/${d.slug}`, '/']
      }),
    ],
    beforeChange: [
      ({ data }) => {
        if (data.body) {
          const { wordCount, toc } = extractLexicalMetadata(data.body)
          data.readingTimeMinutes = calculateReadingTime(wordCount)
          data.tableOfContents = toc
        }
        return data
      },
    ],
    afterRead: [
      ({ doc, findMany, req }) => {
        if (findMany) {
          return doc
        }

        if (!doc.authorName && Array.isArray(doc.author)) {
          const names = doc.author
            .map((a: unknown) => (typeof a === 'object' && a !== null && 'name' in a ? (a as { name: string }).name : null))
            .filter(Boolean)
          
          if (names.length > 0) {
            doc.authorName = names.join(', ')
          }
        } else if (!doc.authorName && doc.author && typeof doc.author === 'object' && 'name' in doc.author) {
          doc.authorName = typeof doc.author.name === 'string' ? doc.author.name : undefined
        }

        if (!doc.body && typeof doc.bodyHtml === 'string') {
          doc.body = convertHtmlToRichText({
            editorConfig: getPayloadEditorConfig(req.payload.config.editor),
            html: doc.bodyHtml,
          })
        }

        if (doc.body && (!doc.readingTimeMinutes || !doc.tableOfContents)) {
          const { wordCount, toc } = extractLexicalMetadata(doc.body)
          if (!doc.readingTimeMinutes) doc.readingTimeMinutes = calculateReadingTime(wordCount)
          if (!doc.tableOfContents) doc.tableOfContents = toc
        }

        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'Used for the URL path /blog/[slug]',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description: 'Short summary for SEO and listing pages',
              },
            },
            {
              name: 'body',
              type: 'richText',
              required: true,
              admin: {
                description: 'Write the full blog post using Payload\'s default rich text editor.',
              },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'mainImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'publishedAt',
              type: 'date',
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              hasMany: true,
              admin: {
                description: 'The primary editor/author of this post.',
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              admin: {
                description: 'Select categories or topic labels for the post.',
              },
            },
            {
              name: 'readingTimeMinutes',
              type: 'number',
              admin: {
                readOnly: true,
                position: 'sidebar',
              },
            },
            {
              name: 'tableOfContents',
              type: 'json',
              admin: {
                readOnly: true,
                hidden: true,
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}