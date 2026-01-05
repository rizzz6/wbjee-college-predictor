/**
 * Export Template Customization
 * Allows users to create custom export formats
 */

import { SanityClient } from '@sanity/client'

export interface ExportField {
    key: string
    label: string
    selected: boolean
}

export interface ExportTemplate {
    name: string
    fields: string[]
    format: 'json' | 'csv' | 'excel'
}

export const AVAILABLE_FIELDS: ExportField[] = [
    { key: '_id', label: 'Document ID', selected: true },
    { key: 'name', label: 'College Name', selected: true },
    { key: 'slug.current', label: 'URL Slug', selected: true },
    { key: 'shortName', label: 'Short Name/Acronym', selected: false },
    { key: 'location', label: 'Location', selected: true },
    { key: 'type', label: 'College Type', selected: true },
    { key: 'estYear', label: 'Established Year', selected: false },
    { key: 'website', label: 'Website URL', selected: false },
    { key: 'isVisible', label: 'Visibility Status', selected: true },
    { key: 'priority', label: 'Display Priority', selected: false },
    { key: 'description', label: 'SEO Description', selected: false },
    { key: 'cutoffIdentifier', label: 'Cutoff Identifier', selected: false },
    { key: 'lastSyncedAt', label: 'Last Synced', selected: false },
    { key: '_createdAt', label: 'Created Date', selected: false },
    { key: '_updatedAt', label: 'Updated Date', selected: false },
]

/**
 * Export colleges with custom template
 */
export async function exportWithTemplate(
    client: SanityClient,
    template: ExportTemplate,
    filter?: 'all' | 'visible' | 'hidden'
): Promise<{ success: boolean; message: string }> {
    try {
        // Build GROQ query with selected fields
        const fieldProjection = template.fields.map(field => {
            // Handle nested fields like slug.current
            if (field.includes('.')) {
                const parts = field.split('.')
                return `"${field}": ${parts[0]}.${parts[1]}`
            }
            return field
        }).join(', ')

        // Build filter query
        const baseQuery = '*[_type == "college"'
        const filterQuery = filter && filter !== 'all'
            ? `${baseQuery} && isVisible == ${filter === 'visible'}]`
            : `${baseQuery}]`

        // Fetch data
        const colleges = await client.fetch(
            `${filterQuery} | order(name asc) { ${fieldProjection} }`
        )

        if (!colleges || colleges.length === 0) {
            return { success: false, message: 'No colleges found to export' }
        }

        // Export based on format
        if (template.format === 'json') {
            return exportAsJSON(colleges, template.name)
        } else if (template.format === 'csv') {
            return exportAsCSV(colleges, template.fields, template.name)
        } else {
            return { success: false, message: 'Excel format not yet implemented' }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Export failed'
        return { success: false, message }
    }
}

/**
 * Export as JSON
 */
function exportAsJSON(data: any[], templateName: string): { success: boolean; message: string } {
    try {
        const dataStr = JSON.stringify(data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${templateName}-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)

        return {
            success: true,
            message: `Exported ${data.length} colleges as JSON`
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'JSON export failed'
        }
    }
}

/**
 * Export as CSV
 */
function exportAsCSV(
    data: any[],
    fields: string[],
    templateName: string
): { success: boolean; message: string } {
    try {
        // Get headers from field labels
        const headers = fields.map(field => {
            const fieldDef = AVAILABLE_FIELDS.find(f => f.key === field)
            return fieldDef ? fieldDef.label : field
        })

        // Convert data to CSV rows
        const rows = data.map(item => {
            return fields.map(field => {
                let value = item[field]

                // Handle nested fields
                if (field.includes('.')) {
                    const parts = field.split('.')
                    value = item[parts[0]]?.[parts[1]]
                }

                // Handle different value types
                if (value === null || value === undefined) {
                    return ''
                } else if (typeof value === 'boolean') {
                    return value ? 'Yes' : 'No'
                } else if (typeof value === 'object') {
                    return JSON.stringify(value)
                } else {
                    return String(value)
                }
            })
        })

        // Build CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row =>
                row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n')

        // Download
        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${templateName}-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)

        return {
            success: true,
            message: `Exported ${data.length} colleges as CSV`
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'CSV export failed'
        }
    }
}

/**
 * Save export template to localStorage
 */
export function saveTemplate(template: ExportTemplate): void {
    const templates = loadTemplates()
    const existing = templates.findIndex(t => t.name === template.name)

    if (existing >= 0) {
        templates[existing] = template
    } else {
        templates.push(template)
    }

    localStorage.setItem('sanity-export-templates', JSON.stringify(templates))
}

/**
 * Load export templates from localStorage
 */
export function loadTemplates(): ExportTemplate[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem('sanity-export-templates')
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

/**
 * Delete export template
 */
export function deleteTemplate(templateName: string): void {
    const templates = loadTemplates().filter(t => t.name !== templateName)
    localStorage.setItem('sanity-export-templates', JSON.stringify(templates))
}
