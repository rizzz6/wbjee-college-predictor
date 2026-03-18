import { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Timeline: CollectionConfig = {
  slug: 'timeline',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'isTentative'],
    group: 'Content',
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
    afterChange: [revalidateCollection(['/timeline', '/', '/api/v1/timeline'])],
    afterDelete: [revalidateCollection(['/timeline', '/', '/api/v1/timeline'])],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'isTentative',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}


