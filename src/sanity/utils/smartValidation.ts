/**
 * Smart Validation System for College Data
 * Provides intelligent validation with auto-fix suggestions
 */

import { SanityClient } from '@sanity/client'

export interface ValidationIssue {
    field: string
    severity: 'error' | 'warning' | 'info'
    message: string
    currentValue?: any
    suggestedFix?: any
    autoFixable: boolean
}

export interface ValidationResult {
    collegeId: string
    collegeName: string
    isValid: boolean
    issues: ValidationIssue[]
    score: number // 0-100
}

/**
 * Validate a single college document
 */
export function validateCollege(college: any): ValidationResult {
    const issues: ValidationIssue[] = []

    // 1. Name validation
    if (!college.name || college.name.trim().length === 0) {
        issues.push({
            field: 'name',
            severity: 'error',
            message: 'College name is required',
            currentValue: college.name,
            autoFixable: false
        })
    } else {
        // Check for common issues
        if (college.name !== college.name.trim()) {
            issues.push({
                field: 'name',
                severity: 'warning',
                message: 'Name has leading/trailing whitespace',
                currentValue: college.name,
                suggestedFix: college.name.trim(),
                autoFixable: true
            })
        }

        // Check for all caps
        if (college.name === college.name.toUpperCase() && college.name.length > 5) {
            issues.push({
                field: 'name',
                severity: 'info',
                message: 'Name is in ALL CAPS - consider title case',
                currentValue: college.name,
                suggestedFix: toTitleCase(college.name),
                autoFixable: true
            })
        }
    }

    // 2. Slug validation
    if (!college.slug?.current) {
        issues.push({
            field: 'slug',
            severity: 'error',
            message: 'Slug is required for URL generation',
            currentValue: null,
            suggestedFix: college.name ? generateSlug(college.name) : null,
            autoFixable: true
        })
    }

    // 3. Location validation
    if (!college.location || college.location.trim().length === 0) {
        issues.push({
            field: 'location',
            severity: 'error',
            message: 'Location is required',
            currentValue: college.location,
            autoFixable: false
        })
    } else {
        // Suggest standardized format
        if (!college.location.includes(',')) {
            issues.push({
                field: 'location',
                severity: 'info',
                message: 'Consider format: "Area, City" (e.g., "Salt Lake, Kolkata")',
                currentValue: college.location,
                autoFixable: false
            })
        }
    }

    // 4. Website URL validation
    if (college.website) {
        if (!college.website.startsWith('http://') && !college.website.startsWith('https://')) {
            issues.push({
                field: 'website',
                severity: 'warning',
                message: 'Website URL should start with http:// or https://',
                currentValue: college.website,
                suggestedFix: `https://${college.website}`,
                autoFixable: true
            })
        }

        // Check for common typos
        if (college.website.includes('htpp://') || college.website.includes('htp://')) {
            issues.push({
                field: 'website',
                severity: 'error',
                message: 'Website URL has typo in protocol',
                currentValue: college.website,
                suggestedFix: college.website.replace(/htp+:\/\//, 'https://'),
                autoFixable: true
            })
        }
    }

    // 5. Established Year validation
    if (college.estYear) {
        const currentYear = new Date().getFullYear()
        if (college.estYear < 1800 || college.estYear > currentYear) {
            issues.push({
                field: 'estYear',
                severity: 'error',
                message: `Invalid year (must be between 1800 and ${currentYear})`,
                currentValue: college.estYear,
                autoFixable: false
            })
        }

        // Future year warning
        if (college.estYear > currentYear) {
            issues.push({
                field: 'estYear',
                severity: 'warning',
                message: 'Established year is in the future',
                currentValue: college.estYear,
                autoFixable: false
            })
        }
    }

    // 6. SEO Description validation
    if (college.description) {
        const length = college.description.length

        if (length < 100) {
            issues.push({
                field: 'description',
                severity: 'warning',
                message: `SEO description too short (${length} chars, recommended: 150-160)`,
                currentValue: college.description,
                autoFixable: false
            })
        } else if (length > 200) {
            issues.push({
                field: 'description',
                severity: 'warning',
                message: `SEO description too long (${length} chars, max: 200)`,
                currentValue: college.description,
                suggestedFix: college.description.substring(0, 197) + '...',
                autoFixable: true
            })
        }
    } else if (college.isVisible) {
        issues.push({
            field: 'description',
            severity: 'warning',
            message: 'Visible college should have SEO description',
            currentValue: null,
            autoFixable: false
        })
    }

    // 7. Logo validation
    if (!college.logo && college.isVisible) {
        issues.push({
            field: 'logo',
            severity: 'error',
            message: 'Logo is required for visible colleges',
            currentValue: null,
            autoFixable: false
        })
    }

    // 8. Visibility check
    if (college.isVisible) {
        const requiredForVisibility = []
        if (!college.logo) requiredForVisibility.push('logo')
        if (!college.description) requiredForVisibility.push('description')
        if (!college.detailsReference) requiredForVisibility.push('college details')

        if (requiredForVisibility.length > 0) {
            issues.push({
                field: 'isVisible',
                severity: 'warning',
                message: `College is visible but missing: ${requiredForVisibility.join(', ')}`,
                currentValue: true,
                suggestedFix: false,
                autoFixable: true
            })
        }
    }

    // 9. Short name validation
    if (college.shortName) {
        if (college.shortName.length > 10) {
            issues.push({
                field: 'shortName',
                severity: 'info',
                message: 'Short name is quite long (consider abbreviation)',
                currentValue: college.shortName,
                autoFixable: false
            })
        }

        // Should be uppercase for acronyms
        if (college.shortName.length <= 5 && college.shortName !== college.shortName.toUpperCase()) {
            issues.push({
                field: 'shortName',
                severity: 'info',
                message: 'Short acronyms are typically uppercase',
                currentValue: college.shortName,
                suggestedFix: college.shortName.toUpperCase(),
                autoFixable: true
            })
        }
    }

    // Calculate quality score
    const errorCount = issues.filter(i => i.severity === 'error').length
    const warningCount = issues.filter(i => i.severity === 'warning').length
    const infoCount = issues.filter(i => i.severity === 'info').length

    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5) - (infoCount * 2))

    return {
        collegeId: college._id,
        collegeName: college.name || 'Unnamed College',
        isValid: errorCount === 0,
        issues,
        score
    }
}

/**
 * Validate multiple colleges
 */
export async function validateColleges(
    client: SanityClient,
    collegeIds?: string[]
): Promise<ValidationResult[]> {
    const query = collegeIds
        ? `*[_type == "college" && _id in $ids]`
        : `*[_type == "college"]`

    const colleges = await client.fetch(
        `${query} {
            _id, name, slug, location, type, estYear, website, 
            shortName, isVisible, description, logo, detailsReference
        }`,
        collegeIds ? { ids: collegeIds } : {}
    )

    return colleges.map(validateCollege)
}

/**
 * Auto-fix issues for a college
 */
export async function autoFixIssues(
    client: SanityClient,
    collegeId: string,
    issues: ValidationIssue[]
): Promise<{ fixed: number; failed: number }> {
    const fixableIssues = issues.filter(i => i.autoFixable && i.suggestedFix !== undefined)

    if (fixableIssues.length === 0) {
        return { fixed: 0, failed: 0 }
    }

    try {
        const patches: any = {}

        fixableIssues.forEach(issue => {
            if (issue.field === 'slug') {
                patches.slug = { _type: 'slug', current: issue.suggestedFix }
            } else {
                patches[issue.field] = issue.suggestedFix
            }
        })

        await client.patch(collegeId).set(patches).commit()

        return { fixed: fixableIssues.length, failed: 0 }
    } catch (error) {
        console.error('Auto-fix failed:', error)
        return { fixed: 0, failed: fixableIssues.length }
    }
}

/**
 * Helper: Generate slug from name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Helper: Convert to title case
 */
function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
