import { SanityClient } from '@sanity/client'
import { processTemplate } from './templateEngine'

export interface BulkUpdateResult {
    collegeId: string
    collegeName: string
    success: boolean
    oldDescription?: string
    newDescription?: string
    error?: string
}

export interface BulkUpdateProgress {
    current: number
    total: number
    currentCollege?: string
}

/**
 * Bulk update SEO descriptions for colleges using a template
 */
export async function bulkUpdateSeoDescriptions(
    client: SanityClient,
    collegeIds: string[],
    template: string,
    onProgress?: (progress: BulkUpdateProgress) => void
): Promise<BulkUpdateResult[]> {
    const results: BulkUpdateResult[] = []

    // Validate inputs
    if (!collegeIds || collegeIds.length === 0) {
        throw new Error('No college IDs provided')
    }

    if (!template || template.trim().length === 0) {
        throw new Error('Template cannot be empty')
    }

    try {
        // Fetch all colleges first
        const colleges = await client.fetch(
            `*[_type == "college" && _id in $ids]{
          _id, name, location, type, estYear, shortName, description
        }`,
            { ids: collegeIds }
        )

        if (!colleges || colleges.length === 0) {
            throw new Error('No colleges found with the provided IDs')
        }

        const total = colleges.length

        for (let i = 0; i < colleges.length; i++) {
            const college = colleges[i]

            // Report progress
            onProgress?.({
                current: i + 1,
                total,
                currentCollege: college.name
            })

            try {
                const newDescription = processTemplate(template, college)

                // Skip if description is empty after processing
                if (!newDescription || newDescription.trim().length === 0) {
                    results.push({
                        collegeId: college._id,
                        collegeName: college.name,
                        success: false,
                        error: 'Generated description is empty'
                    })
                    continue
                }

                // Validate description length (SEO best practice: 150-160 chars)
                if (newDescription.length > 200) {
                    results.push({
                        collegeId: college._id,
                        collegeName: college.name,
                        success: false,
                        error: `Description too long (${newDescription.length} chars, max 200)`
                    })
                    continue
                }

                // Update the college
                await client
                    .patch(college._id)
                    .set({ description: newDescription })
                    .commit()

                results.push({
                    collegeId: college._id,
                    collegeName: college.name,
                    success: true,
                    oldDescription: college.description,
                    newDescription
                })

                // Small delay to avoid rate limiting (100ms)
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                results.push({
                    collegeId: college._id,
                    collegeName: college.name,
                    success: false,
                    oldDescription: college.description,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return results
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch colleges'
        throw new Error(`Bulk update failed: ${message}`)
    }
}

/**
 * Fetch colleges for preview (limited to first N)
 */
interface CollegePreview {
    _id: string
    name: string
    location?: string
    type?: string
    estYear?: number
    shortName?: string
    description?: string
    isVisible?: boolean
}

export async function fetchCollegesForPreview(
    client: SanityClient,
    filter: 'all' | 'visible' | 'hidden',
    limit: number = 10
): Promise<CollegePreview[]> {
    try {
        const baseQuery = '*[_type == "college"'
        const filterQuery = filter === 'all'
            ? baseQuery + ']'
            : baseQuery + ` && isVisible == ${filter === 'visible'}]`

        const colleges = await client.fetch(
            `${filterQuery}[0...${limit}]{
          _id, name, location, type, estYear, shortName, description, isVisible
        }`
        )

        return colleges || []
    } catch (error) {
        console.error('Failed to fetch colleges for preview:', error)
        return []
    }
}

/**
 * Get count of colleges matching filter
 */
export async function getCollegeCount(
    client: SanityClient,
    filter: 'all' | 'visible' | 'hidden'
): Promise<number> {
    try {
        const baseQuery = '_type == "college"'
        const filterQuery = filter === 'all'
            ? baseQuery
            : `${baseQuery} && isVisible == ${filter === 'visible'}`

        const count = await client.fetch(`count(*[${filterQuery}])`)
        return count || 0
    } catch (error) {
        console.error('Failed to get college count:', error)
        return 0
    }
}
