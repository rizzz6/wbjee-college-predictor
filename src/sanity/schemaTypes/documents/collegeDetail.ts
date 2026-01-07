import { defineField, defineType } from 'sanity'

export const collegeDetailType = defineType({
    name: 'collegeDetail',
    title: 'College Detail (Source Data)',
    type: 'document',
    // Hidden from main navigation - only accessible via college reference
    fields: [
        defineField({
            name: 'name',
            type: 'string',
            title: 'College Name',
            description: 'Name from JSON source',
            validation: Rule => Rule.required().error('College name is required'),
        }),
        defineField({
            name: 'location',
            type: 'string',
            title: 'Location',
            validation: Rule => Rule.required().error('Location is required'),
        }),
        defineField({
            name: 'type',
            type: 'string',
            title: 'Type',
            options: {
                list: [
                    { title: 'Government', value: 'Govt' },
                    { title: 'Private', value: 'Pvt' },
                ],
            },
            validation: Rule => Rule.required().error('Type is required'),
        }),
        defineField({
            name: 'website',
            type: 'url',
            title: 'Website',
        }),
        defineField({
            name: 'seoDescription',
            type: 'text',
            title: 'SEO Description',
            rows: 3,
        }),
        defineField({
            name: 'highlights',
            type: 'array',
            title: 'Highlights',
            of: [{ type: 'string' }],
            validation: Rule => Rule.required().min(3).max(10)
                .custom((highlights: string[] | undefined) => {
                    if (!highlights) return true

                    // Check for duplicates
                    const unique = new Set(highlights)
                    if (unique.size !== highlights.length) {
                        return 'Duplicate highlights found'
                    }

                    // Check for empty entries
                    const hasEmpty = highlights.some(h => !h.trim())
                    if (hasEmpty) {
                        return 'Empty highlights not allowed'
                    }

                    return true
                }),
        }),
        defineField({
            name: 'about',
            type: 'object',
            title: 'About (Paragraphs)',
            fields: [
                {
                    name: 'para1',
                    type: 'text',
                    title: 'Paragraph 1',
                    validation: Rule => Rule.required().min(50).error('Paragraph 1 is required (min 50 characters)')
                },
                { name: 'para2', type: 'text', title: 'Paragraph 2' },
                { name: 'para3', type: 'text', title: 'Paragraph 3' },
                { name: 'para4', type: 'text', title: 'Paragraph 4' },
            ],
        }),
        defineField({
            name: 'feesStats',
            type: 'object',
            title: 'Fee Statistics',
            fields: [
                { name: 'tuitionFee', type: 'string', title: 'Tuition Fee' },
                { name: 'totalCost', type: 'string', title: 'Total Cost' },
                { name: 'scholarships', type: 'text', title: 'Scholarships' },
            ],
        }),
        defineField({
            name: 'placementStats',
            type: 'object',
            title: 'Placement Statistics',
            validation: Rule => Rule.custom((value: unknown) => {
                const stats = value as Record<string, string> | undefined
                if (stats?.highestPackage && stats?.averagePackage) {
                    const highest = parseFloat(stats.highestPackage.replace(/[^0-9.]/g, ''))
                    const average = parseFloat(stats.averagePackage.replace(/[^0-9.]/g, ''))
                    if (!isNaN(highest) && !isNaN(average) && highest < average) {
                        return 'Highest package must be >= average package'
                    }
                }
                return true
            }),
            fields: [
                defineField({
                    name: 'highestPackage',
                    type: 'string',
                    title: 'Highest Package',
                }),
                defineField({
                    name: 'averagePackage',
                    type: 'string',
                    title: 'Average Package',
                }),
                defineField({
                    name: 'nirfMedianSalary',
                    type: 'string',
                    title: 'NIRF Median Salary',
                }),
                defineField({
                    name: 'topRecruiters',
                    type: 'array',
                    title: 'Top Recruiters',
                    of: [{ type: 'string' }],
                }),
                defineField({
                    name: 'sourceReliability',
                    type: 'string',
                    title: 'Source Reliability',
                }),
                defineField({
                    name: 'dataSource',
                    type: 'string',
                    title: 'Data Source',
                }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'location',
        },
    },
})
