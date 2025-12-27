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

import { CustomDeployWidget } from './src/sanity/components/CustomDeployWidget'

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

    // Dashboard tool with Custom Deploy Button
    dashboardTool({
      widgets: [
        {
          name: 'deploy-production',
          component: CustomDeployWidget,
          layout: { width: 'medium', height: 'small' }
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
})

