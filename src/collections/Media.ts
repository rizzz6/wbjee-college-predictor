import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: {
    group: 'Uploads',
  },
  access: {
    read: () => true, // Make media publicly readable
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}
