'use client'

import './src/sanity/studio.css'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dashboardTool } from '@sanity/dashboard'
import { media } from 'sanity-plugin-media'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { table } from '@sanity/table'
import StudioIcon from './src/sanity/components/StudioIcon'
import { customTheme } from './src/sanity/theme/customTheme'

// Import the new tabbed dashboard
import { TabbedDashboard } from './src/sanity/components/dashboard'
import { DuplicateAction } from './src/sanity/actions/DuplicateAction'

export default defineConfig({
  name: 'rwbjee-studio',
  title: 'rwbjee Content Studio',
  subtitle: 'WBJEE Companion CMS',

  basePath: '/studio',
  projectId,
  dataset,

  // Custom branding
  icon: StudioIcon,
  theme: customTheme,

  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),

    // Dashboard tool with Tabbed Dashboard
    dashboardTool({
      widgets: [
        {
          name: 'tabbed-dashboard',
          component: TabbedDashboard,
          layout: { width: 'full', height: 'auto' }
        }
      ],
    }),

    // Media Library for organized asset management
    media(),

    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    table()
  ],

  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'college') {
        return [...prev, DuplicateAction]
      }
      return prev
    },
    productionUrl: async (prev, context) => {
      const { document } = context

      // Only add preview for college documents
      if (document._type === 'college') {
        const slug = (document as { slug?: { current: string } }).slug?.current
        if (slug) {
          // Use environment variable or fallback to localhost in dev
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          return `${baseUrl}/colleges/${slug}`
        }
      }

      return prev
    }
  }
})
