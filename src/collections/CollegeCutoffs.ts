import { CollectionConfig } from 'payload'

export const CollegeCutoffs: CollectionConfig = {
  slug: 'college_cutoffs',
  admin: {
    useAsTitle: 'institute',
    group: 'Content',
    defaultColumns: ['institute', 'college'],
  },
  fields: [
    {
      name: 'college',
      type: 'relationship',
      relationTo: 'colleges',
      admin: { description: 'Linked Payload college document' },
    },
    {
      name: 'institute',
      type: 'text',
      required: true,
      admin: { description: 'Raw institute name from cutoffs table (for display/fallback)' },
    },
    {
      name: 'cutoffs',
      type: 'array',
      fields: [
        { name: 'year', type: 'number', required: true },
        { name: 'program', type: 'text', required: true },
        { name: 'quota', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'seatType', type: 'text' },
        { name: 'round', type: 'text' },
        { name: 'openingRank', type: 'number' },
        { name: 'closingRank', type: 'number' },
      ],
    },
  ],
}
