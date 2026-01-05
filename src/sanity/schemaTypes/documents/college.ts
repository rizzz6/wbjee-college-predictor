import { defineField, defineType } from 'sanity'
import { InfoOutlineIcon, LinkIcon, DocumentTextIcon, WarningOutlineIcon, CheckmarkCircleIcon, CloseCircleIcon, LockIcon } from '@sanity/icons'
import CutoffInstituteInput from '../../components/CutoffInstituteInput'
import CollegeDetailReferenceInput from '../../components/CollegeDetailReference'
import { CollegePreview } from '../../components/CollegePreview'

export const collegeType = defineType({
  name: 'college',
  title: 'College',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'media', title: 'Images' },
    { name: 'content', title: 'Content & Description' },
    { name: 'data', title: 'Stats & Data Tables' },
    { name: 'sync', title: 'Data Sync' },
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'College Name',
      group: 'basic',
      validation: Rule => Rule.required().error('College name is required'),
    }),
    defineField({
      name: 'isVisible',
      type: 'boolean',
      title: 'Visible on Website?',
      description: 'Toggle ON only after adding Logo, Details, and verifying data quality.',
      icon: WarningOutlineIcon,
      initialValue: false,
      group: 'basic',
    }),
    defineField({
      name: 'shortName',
      type: 'string',
      title: 'Short Name / Acronym',
      description: 'e.g., "IEM" for Institute of Engineering & Management',
      group: 'basic',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL Slug',
      description: 'Auto-generated from name. Used in college page URL.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required().error('Slug is required for URL generation'),
      group: 'basic',
    }),
    defineField({
      name: 'location',
      type: 'string',
      title: 'Location',
      description: 'City/Area, e.g., "Salt Lake, Kolkata" or "Jadavpur, Kolkata"',
      validation: Rule => Rule.required().error('Location is required'),
      group: 'basic',
    }),
    defineField({
      name: 'type',
      type: 'string',
      title: 'College Type',
      options: {
        list: [
          { title: 'Government', value: 'Government' },
          { title: 'Private', value: 'Private' },
          { title: 'Semi-Government', value: 'Semi-Govt' },
        ],
      },
      validation: Rule => Rule.required().error('College type is required'),
      group: 'basic',
    }),
    defineField({
      name: 'estYear',
      type: 'number',
      title: 'Established Year',
      description: 'Year the college was founded',
      validation: Rule => Rule.min(1800).max(new Date().getFullYear()).error('Enter a valid year between 1800 and current year'),
      group: 'basic',
    }),
    defineField({
      name: 'website',
      type: 'url',
      title: 'Official Website',
      description: 'College official website URL (must start with https:// or http://)',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https']
      }).warning('Please ensure the URL is correct and accessible'),
      group: 'basic',
    }),
    defineField({
      name: 'priority',
      type: 'number',
      title: 'Display Priority',
      description: 'Controls sorting order on college listing pages',
      options: {
        list: [
          { title: '1 - Top Tier (Premium colleges)', value: 1 },
          { title: '2 - High Priority (Well-known colleges)', value: 2 },
          { title: '3 - Standard (Regular colleges)', value: 3 },
        ],
      },
      initialValue: 3,
      validation: Rule => Rule.required().min(1).max(3).integer().error('Priority must be 1, 2, or 3'),
      group: 'basic',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'College Logo',
      description: 'Square logo (recommended: 512×512px, transparent background)',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required().error('Logo is required for visibility'),
      group: 'media',
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      description: 'Hero image of the campus (recommended: 1920×1080px)',
      options: {
        hotspot: true,
      },
      group: 'media',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Meta Description (SEO)',
      description: 'Keep between 150-160 characters for optimal SEO. Shown in search results.',
      icon: DocumentTextIcon,
      rows: 3,
      validation: Rule => Rule.min(100).max(160).warning('Ideal length: 150-160 characters for SEO'),
      group: 'content',
    }),
    defineField({
      name: 'highlights',
      type: 'array',
      title: 'Key Highlights',
      description: 'Notable achievements: "NAAC A++", "NIRF Rank 15", "100% Placement", etc. (Auto-synced from Details)',
      of: [{ type: 'string' }],
      validation: Rule => Rule.max(8).warning('Keep highlights concise - max 8 points'),
      group: 'content',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'About the College',
      description: 'Detailed description about the college (Auto-synced from Details)',
      group: 'content',
    }),
    defineField({
      name: 'fees',
      type: 'table',
      title: 'Fee Structure (Manual Entry)',
      description: 'Only use if NOT syncing from Detail source. Otherwise, data will be overwritten.',
      icon: WarningOutlineIcon,
      hidden: ({ document }) => !!document?.detailsIdentifier,
      group: 'data',
    }),
    defineField({
      name: 'feeStructure',
      type: 'table',
      title: 'Fee Structure (Auto-Synced)',
      description: 'Auto-populated from collegeDetail. You can edit and push changes back using the Push button.',
      icon: CheckmarkCircleIcon,
      hidden: ({ document }) => !document?.detailsIdentifier,
      group: 'data',
    }),
    defineField({
      name: 'placements',
      type: 'table',
      title: 'Placement Statistics',
      description: 'Placement data (highest package, average, recruiters). Auto-synced if using Detail source.',
      group: 'data',
    }),
    defineField({
      name: 'cutoffs',
      type: 'blockContent',
      title: 'Cutoff Information',
      description: 'Previous year cutoff ranks and trends (optional - usually fetched from database)',
      group: 'data',
    }),
    defineField({
      name: 'cutoffIdentifier',
      type: 'string',
      title: 'Cutoff Database Identifier',
      description: 'Links this college to cutoff records in the database. Select from the dropdown.',
      icon: LinkIcon,
      components: {
        input: CutoffInstituteInput,
      },
      group: 'sync',
    }),
    defineField({
      name: 'detailsIdentifier',
      type: 'reference',
      to: [{ type: 'collegeDetail' }],
      title: 'College Details Source',
      description: 'Select a detail record to auto-sync highlights, fees, placements, and about content.',
      icon: LinkIcon,
      components: {
        input: CollegeDetailReferenceInput,
      },
      group: 'sync',
    }),
    defineField({
      name: 'lastSyncedAt',
      type: 'datetime',
      title: 'Last Synced',
      description: 'Timestamp of last successful sync from collegeDetail',
      readOnly: true,
      group: 'sync',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'logo',
      type: 'type',
      isVisible: 'isVisible',
      lastSyncedAt: 'lastSyncedAt',
      highlights: 'highlights',
      estYear: 'estYear',
      description: 'description',
      website: 'website',
      fees: 'fees',
      feeStructure: 'feeStructure',
      placements: 'placements',
      coverImage: 'coverImage',
      detailsIdentifier: 'detailsIdentifier'
    },
    prepare({ title, subtitle, type, isVisible, media, lastSyncedAt, highlights, estYear, description, website, fees, feeStructure, placements, coverImage, detailsIdentifier }) {
      // Quality Score Calculation
      let score = 0
      if (media) score += 20
      if (coverImage) score += 15
      if (highlights && highlights.length > 0) score += 15
      if (description) score += 15
      if (fees || feeStructure) score += 10
      if (placements) score += 10
      if (website) score += 5
      if (estYear) score += 5
      if (detailsIdentifier) score += 5

      const scoreEmoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴'

      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
      const syncStatus = lastSyncedAt ?
        ((Date.now() - new Date(lastSyncedAt).getTime()) < SEVEN_DAYS ? 'Synced' : 'Outdated')
        : 'Not Synced'

      const visibilityTag = isVisible ? '' : ' • HIDDEN'

      return {
        title: title + (estYear ? ` (${estYear})` : ''),
        subtitle: `${scoreEmoji} Score: ${score}/100 • ${type} • ${syncStatus}${visibilityTag}`,
        media: media
      }
    }
  },
})