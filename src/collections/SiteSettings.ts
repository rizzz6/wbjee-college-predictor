import { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidateGlobal'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Admin',
  },
  versions: {
    drafts: {
      autosave: true,
    },
    max: 50,
  },
  hooks: {
    afterChange: [revalidateGlobal(['/', '/colleges', '/blog'])],
  },
  fields: [
    {
      name: 'announcement',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show or hide the sitewide announcement banner' },
        },
        {
          name: 'message',
          type: 'text',
          admin: { description: 'The text message to display in the banner' },
        },
        {
          name: 'linkUrl',
          type: 'text',
          admin: { description: 'Optional URL for the banner action button' },
        },
        {
          name: 'linkText',
          type: 'text',
          admin: { description: 'Text for the banner action button' },
        },
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Information', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
          ],
          defaultValue: 'info',
        },
      ],
    },
    {
      name: 'deployHooks',
      type: 'array',
      admin: {
        description: 'Configure external webhooks to trigger site deployments (e.g. Vercel)',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}


