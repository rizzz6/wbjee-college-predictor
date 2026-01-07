/**
 * Template engine for dynamic SEO description generation
 * Supports variables like {college.name}, {college.location}, etc.
 */

export interface TemplateVariable {
    key: string
    label: string
    example: string
    description: string
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
    {
        key: '{college.name}',
        label: 'College Name',
        example: 'Jadavpur University',
        description: 'Full college name'
    },
    {
        key: '{college.location}',
        label: 'Location',
        example: 'Jadavpur, Kolkata',
        description: 'City/area location'
    },
    {
        key: '{college.type}',
        label: 'Type',
        example: 'Government',
        description: 'Government/Private/Semi-Govt'
    },
    {
        key: '{college.estYear}',
        label: 'Established Year',
        example: '1955',
        description: 'Year college was founded'
    },
    {
        key: '{college.shortName}',
        label: 'Short Name',
        example: 'JU',
        description: 'Acronym (fallback to full name if not set)'
    }
]

interface CollegeTemplate {
    name?: string
    location?: string
    type?: string
    estYear?: number
    shortName?: string
}

/**
 * Process a template string by replacing variables with college data
 */
export function processTemplate(template: string, college: CollegeTemplate): string {
    let result = template

    // Replace each variable with actual data
    result = result.replace(/{college\.name}/g, college.name || '')
    result = result.replace(/{college\.location}/g, college.location || '')
    result = result.replace(/{college\.type}/g, college.type || '')
    result = result.replace(/{college\.estYear}/g, college.estYear?.toString() || '')
    result = result.replace(/{college\.shortName}/g, college.shortName || college.name || '')

    return result.trim()
}

/**
 * Validate a template string for errors
 */
export function validateTemplate(template: string): {
    valid: boolean
    errors: string[]
    warnings: string[]
} {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for invalid variables
    const variablePattern = /{college\.\w+}/g
    const matches = template.match(variablePattern) || []
    const validKeys = AVAILABLE_VARIABLES.map(v => v.key)

    matches.forEach(match => {
        if (!validKeys.includes(match)) {
            errors.push(`Unknown variable: ${match}`)
        }
    })

    // Check for empty template
    if (!template || template.trim().length === 0) {
        errors.push('Template cannot be empty')
    }

    // Check length (warning for SEO best practices)
    if (template.length < 100) {
        warnings.push('Template is quite short. SEO descriptions work best at 150-160 characters.')
    }
    if (template.length > 200) {
        warnings.push('Template might be too long. Google truncates descriptions over 160 characters.')
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Get character count after processing template with sample data
 */
export function getProcessedLength(template: string): { min: number; max: number; avg: number } {
    const samples = [
        { name: 'Jadavpur University', location: 'Jadavpur, Kolkata', type: 'Government', estYear: 1955, shortName: 'JU' },
        { name: 'Heritage Institute of Technology', location: 'Anandapur, Kolkata', type: 'Private', estYear: 2001, shortName: 'HIT' },
        { name: 'National Institute of Technology', location: 'Mahatma Gandhi Avenue, Durgapur', type: 'Government', estYear: 1960, shortName: 'NIT Durgapur' }
    ]

    const lengths = samples.map(s => processTemplate(template, s).length)

    return {
        min: Math.min(...lengths),
        max: Math.max(...lengths),
        avg: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    }
}
