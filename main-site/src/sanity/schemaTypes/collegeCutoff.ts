import {defineField, defineType} from 'sanity'

export const collegeCutoffType = defineType({
  name: 'collegeCutoff',
  title: 'College Cutoff',
  type: 'document',
  fields: [
    defineField({
      name: 'institute',
      type: 'string',
      title: 'Institute',
      description: 'The unique identifier for the college',
    }),
    defineField({
      name: 'cutoffs',
      type: 'array',
      title: 'Cutoffs',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'year',
              type: 'number',
              title: 'Year',
            }),
            defineField({
              name: 'program',
              type: 'string',
              title: 'Program',
            }),
            defineField({
              name: 'quota',
              type: 'string',
              title: 'Quota',
            }),
            defineField({
              name: 'category',
              type: 'string',
              title: 'Category',
            }),
            defineField({
              name: 'seatType',
              type: 'string',
              title: 'Seat Type',
            }),
            defineField({
              name: 'round',
              type: 'string',
              title: 'Round',
            }),
            defineField({
              name: 'openingRank',
              type: 'number',
              title: 'Opening Rank',
            }),
            defineField({
              name: 'closingRank',
              type: 'number',
              title: 'Closing Rank',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'institute',
      subtitle: 'cutoffs',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title,
        subtitle: `${subtitle?.length || 0} cutoff entries`,
      }
    },
  },
})