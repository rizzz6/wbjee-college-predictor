import {defineField, defineType} from 'sanity'

export const cutoffType = defineType({
  name: 'cutoff',
  title: 'Cutoff',
  type: 'document',
  fields: [
    defineField({
      name: 'institute',
      type: 'string',
      title: 'Institute',
      description: 'The name of the college',
    }),
    defineField({
      name: 'program',
      type: 'string',
      title: 'Program',
      description: 'The branch (e.g., CSE)',
    }),
    defineField({
      name: 'quota',
      type: 'string',
      title: 'Quota',
      description: 'e.g., All India, Home State',
      options: {
        list: [
          { title: 'All India', value: 'All India' },
          { title: 'Home State', value: 'Home State' },
        ],
      },
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      description: 'e.g., Open, SC, ST',
      options: {
        list: [
          { title: 'Open', value: 'Open' },
          { title: 'SC', value: 'SC' },
          { title: 'ST', value: 'ST' },
          { title: 'OBC-A', value: 'OBC-A' },
          { title: 'OBC-B', value: 'OBC-B' },
        ],
      },
    }),
    defineField({
      name: 'seatType',
      type: 'string',
      title: 'Seat Type',
      description: 'e.g., WBJEE Seats',
      options: {
        list: [
          { title: 'WBJEE Seats', value: 'WBJEE Seats' },
          { title: 'JEE Main Seats', value: 'JEE Main Seats' },
        ],
      },
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      description: 'e.g., 2024',
    }),
    defineField({
      name: 'round',
      type: 'string',
      title: 'Round',
      description: 'e.g., Round 1',
      options: {
        list: [
          { title: 'Round 1', value: 'Round 1' },
          { title: 'Round 2', value: 'Round 2' },
          { title: 'Round 3', value: 'Round 3' },
        ],
      },
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
  preview: {
    select: {
      title: 'institute',
      subtitle: 'program',
    },
  },
})