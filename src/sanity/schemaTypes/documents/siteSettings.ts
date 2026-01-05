import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'announcement',
            title: 'Top Announcement Banner',
            type: 'object',
            fields: [
                {
                    name: 'enabled',
                    title: 'Show Banner?',
                    type: 'boolean',
                    initialValue: false,
                },
                {
                    name: 'message',
                    title: 'Message',
                    type: 'string',
                    description: 'Keep it concise (max ~100 chars)',
                },
                {
                    name: 'linkUrl',
                    title: 'Link URL (optional)',
                    type: 'url',
                    description: 'Where should the banner link to?',
                },
                {
                    name: 'linkText',
                    title: 'Link Text',
                    type: 'string',
                    initialValue: 'Learn More',
                },
                {
                    name: 'variant',
                    title: 'Style',
                    type: 'string',
                    options: {
                        list: [
                            { title: '🔵 Info (Blue)', value: 'info' },
                            { title: '🟡 Warning (Yellow)', value: 'warning' },
                            { title: '🔴 Alert (Red)', value: 'alert' },
                        ],
                    },
                    initialValue: 'info',
                },
            ],
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Site Settings',
            }
        },
    },
})
