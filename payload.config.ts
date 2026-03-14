import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Colleges } from './src/collections/Colleges'
import { Media } from './src/collections/Media'
import { CollegeCutoffs } from './src/collections/CollegeCutoffs'
import { Posts } from './src/collections/Posts'
import { Timeline } from './src/collections/Timeline'
import { SiteSettings } from './src/collections/SiteSettings'
import { Users } from './src/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === 'production'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- rwbjee',
      icons: [{
        url: '/assets/logo.svg',
      }],
      openGraph: {
        images: [{
          url: '/assets/images/og-image.svg',
        }],
      },
    },
    components: {
      Nav: '@/components/admin/Nav#default',
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
      afterDashboard: ['@/components/admin/DashboardAnalytics#default'],
      views: {
        Analytics: {
          Component: '@/components/admin/views/Analytics/index#default',
          path: '/analytics',
        },
        Quality: {
          Component: '@/components/admin/views/QualityAudit/index#default',
          path: '/quality',
        },
        DataManagement: {
          Component: '@/components/admin/views/DataManagement/index#default',
          path: '/data-management',
        },
        Operations: {
          Component: '@/components/admin/views/Operations/index#default',
          path: '/operations',
        },
        account: {
          Component: '@/components/admin/views/Account/index#default',
        },
      },
    },
  },
  editor: lexicalEditor({}),
  collections: [Colleges, CollegeCutoffs, Media, Posts, Timeline, Users],
  globals: [SiteSettings],
  secret: requireEnv('PAYLOAD_SECRET'),
  db: postgresAdapter({
    pool: {
      connectionString: requireEnv('DATABASE_URI'),
    },
    schemaName: 'payload',
    push: !isProduction,
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'ap-south-1',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
