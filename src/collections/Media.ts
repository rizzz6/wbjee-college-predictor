import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true, // Enables file uploads
  admin: {
    group: 'Uploads',
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}
