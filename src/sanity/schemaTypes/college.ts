import {defineField, defineType} from 'sanity'
import CutoffInstituteInput from '../components/CutoffInstituteInput'

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
      name: 'isVisible',
      type: 'boolean',
      title: 'Visible on Website?',
      description: 'Toggle this ON only when you have added the Logo, Fees, and other details.',
      initialValue: false,
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
      name: 'body',
      type: 'blockContent',
      title: 'About the Institute',
    }),
    defineField({
      name: 'priority',
      type: 'number',
      title: 'Display Priority',
      description: '1 = Highest Priority (Top Colleges), 2 = High, 3 = Standard. Controls sorting order.',
      initialValue: 3,
    }),
    defineField({
      name: 'fees',
      type: 'table',
      title: 'Fee Structure Table',
    }),
    defineField({
      name: 'placements',
      type: 'table',
      title: 'Placement Statistics',
    }),
    defineField({
      name: 'cutoffs',
      type: 'blockContent',
      title: 'Cutoffs',
      description: 'Previous year ranks',
    }),
    defineField({
      name: 'cutoffIdentifier',
      type: 'string',
      title: 'Official Name in Cutoff Data',
      description: 'Copy the EXACT name from the cutoff data here (e.g., "Jadavpur University"). This is used to fetch the table.',
      components: {
        input: CutoffInstituteInput,
      },
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