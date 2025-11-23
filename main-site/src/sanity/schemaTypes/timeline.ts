import {defineField, defineType} from 'sanity'

export const timelineType = defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      title: 'Date',
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'URL',
    }),
    defineField({
      name: 'isTentative',
      type: 'boolean',
      title: 'Is Tentative',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
    },
  },
})