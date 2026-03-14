import { CollectionConfig } from 'payload'

export const Colleges: CollectionConfig = {
  slug: 'colleges',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'type', 'location', 'isVisible', 'priority'],
    preview: (doc, { token }) => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${serverUrl}/api/preview?url=/colleges/${doc.slug}&token=${token}`
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    // --- Basic Info ---
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'shortName', type: 'text' },
    { name: 'location', type: 'text' },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Government', value: 'Government' },
        { label: 'Private', value: 'Private' },
        { label: 'University', value: 'University' },
        { label: 'Semi-Government', value: 'Semi-Govt' },
      ],
    },
    { name: 'website', type: 'text' },
    {
      name: 'isVisible',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether the college is visible on the public site' },
    },
    { name: 'estYear', type: 'number' },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 3,
      admin: { description: '1=Top Tier, 2=High, 3=Standard' },
    },

    // --- Media ---
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },

    // --- Content ---
    { name: 'seoDescription', type: 'textarea' },
    {
      name: 'highlights',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'about',
      type: 'group',
      fields: [
        { name: 'para1', type: 'textarea' },
        { name: 'para2', type: 'textarea' },
      ],
    },
    { name: 'body', type: 'richText' },

    // --- Stats ---
    {
      name: 'placementStats',
      type: 'group',
      fields: [
        { name: 'highestPackage', type: 'text' },
        { name: 'averagePackage', type: 'text' },
        { name: 'nirfMedianSalary', type: 'text' },
        {
          name: 'topRecruiters',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        {
          name: 'sourceReliability',
          type: 'select',
          options: ['High', 'Medium', 'Low'],
        },
        { name: 'dataSource', type: 'text' },
      ],
    },
    {
      name: 'feesStats',
      type: 'group',
      fields: [
        { name: 'totalCourseFee', type: 'text' },
        { name: 'feePerSemester', type: 'text' },
      ],
    },

    // --- Sync / Linking ---
    {
      name: 'cutoffIdentifier',
      type: 'relationship',
      relationTo: 'college_cutoffs',
      admin: {
        description: 'Linked record in the cutoffs collection (helps match cutoffs to this college)',
      },
    },
    { name: 'sanityId', type: 'text', admin: { readOnly: true } },
  ],
}


