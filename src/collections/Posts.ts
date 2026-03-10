import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
    group: 'Content',
    preview: (doc, { token }) => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
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
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
          description: 'Array of strings for categories/tags'
      }
    },
    {
      name: 'bodyHtml',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Full blog post content in HTML format (converted from Sanity PortableText)',
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
      name: 'sanityId',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
