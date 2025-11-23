import {defineField, defineType} from 'sanity'

export const collegeType = defineType({
  name: 'college',
  title: 'College',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'College Name',
    }),
    defineField({
      name: 'shortName',
      type: 'string',
      title: 'Short Name',
      description: 'e.g., IEM',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      description: 'A photo of the campus',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'location',
      type: 'string',
      title: 'Location',
      description: 'e.g., Salt Lake, Kolkata',
    }),
    defineField({
      name: 'type',
      type: 'string',
      title: 'Type',
      options: {
        list: [
          { title: 'Government', value: 'Government' },
          { title: 'Private', value: 'Private' },
          { title: 'Semi-Govt', value: 'Semi-Govt' },
        ],
      },
    }),
    defineField({
      name: 'estYear',
      type: 'number',
      title: 'Established Year',
    }),
    defineField({
      name: 'website',
      type: 'url',
      title: 'Website',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'A short summary',
    }),
    defineField({
      name: 'fees',
      type: 'blockContent',
      title: 'Fees',
      description: 'Fee structure table',
    }),
    defineField({
      name: 'placements',
      type: 'blockContent',
      title: 'Placements',
      description: 'Placement stats',
    }),
    defineField({
      name: 'cutoffs',
      type: 'blockContent',
      title: 'Cutoffs',
      description: 'Previous year ranks',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'logo',
    },
  },
})