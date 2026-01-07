import type { SanityClient } from '@sanity/client'

export interface ExportResult {
    success: boolean
    message: string
    count?: number
}

export interface DeleteResult {
    success: boolean
    message: string
    deletedCount?: number
}

export interface ImportResult {
    success: boolean
    message: string
    importedCount?: number
}

export interface PublishResult {
    success: boolean
    message: string
    publishedCount?: number
}

export interface ValidationResult {
    success: boolean
    message: string
    issues: ValidationIssue[]
}

export interface ValidationIssue {
    collegeId: string
    collegeName: string
    issues: string[]
}

export interface RebuildResult {
    success: boolean
    message: string
}

/**
 * Export colleges to JSON or CSV format
 */
export async function exportColleges(
    client: SanityClient,
    format: 'json' | 'csv'
): Promise<ExportResult> {
    try {
        const colleges = await client.fetch(`*[_type == "college"] | order(name asc) {
            _id,
            name,
            slug,
            location,
            type,
            estYear,
            website,
            isVisible,
            priority,
            cutoffIdentifier,
            lastSyncedAt
        }`)

        if (!colleges || colleges.length === 0) {
            return { success: false, message: 'No colleges found to export' }
        }

        if (format === 'json') {
            const dataStr = JSON.stringify(colleges, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `colleges-export-${new Date().toISOString().split('T')[0]}.json`
            link.click()
            URL.revokeObjectURL(url)
        } else {
            // CSV export
            const headers = ['ID', 'Name', 'Slug', 'Location', 'Type', 'Est. Year', 'Website', 'Visible', 'Priority', 'Cutoff ID', 'Last Synced']
            interface ExportCollege {
                _id: string
                name: string
                slug?: { current: string }
                location: string
                type: string
                estYear?: number
                website?: string
                isVisible: boolean
                priority: number
                cutoffIdentifier?: string
                lastSyncedAt?: string
            }

            const rows = (colleges as ExportCollege[]).map((c) => [
                c._id,
                c.name,
                c.slug?.current || '',
                c.location,
                c.type,
                c.estYear || '',
                c.website || '',
                c.isVisible ? 'Yes' : 'No',
                c.priority,
                c.cutoffIdentifier || '',
                c.lastSyncedAt || ''
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
            ].join('\n')

            const dataBlob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `colleges-export-${new Date().toISOString().split('T')[0]}.csv`
            link.click()
            URL.revokeObjectURL(url)
        }

        return {
            success: true,
            message: `Exported ${colleges.length} colleges as ${format.toUpperCase()}`,
            count: colleges.length
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Export failed'
        return { success: false, message }
    }
}

/**
 * Delete all college documents
 */
export async function deleteAllColleges(client: SanityClient): Promise<DeleteResult> {
    try {
        const colleges = await client.fetch(`*[_type == "college"]{ _id }`)

        if (!colleges || colleges.length === 0) {
            return { success: false, message: 'No colleges found to delete' }
        }

        const mutations = (colleges as { _id: string }[]).map((c) => ({ delete: { id: c._id } }))
        await client.transaction(mutations).commit()

        return {
            success: true,
            message: `Deleted ${colleges.length} colleges`,
            deletedCount: colleges.length
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete failed'
        return { success: false, message }
    }
}

/**
 * Import colleges from JSON file
 */
export async function importCollegesFromJSON(
    client: SanityClient,
    file: File
): Promise<ImportResult> {
    try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!Array.isArray(data)) {
            return { success: false, message: 'Invalid JSON format. Expected an array of colleges.' }
        }

        let imported = 0
        let skipped = 0

        for (const item of data) {
            try {
                // Remove _id if present (we want Sanity to generate new ones)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id: _unusedId, ...rest } = item

                // Ensure required fields
                if (!rest.name || !rest.slug) {
                    skipped++
                    continue
                }

                await client.create({
                    _type: 'college',
                    ...rest
                })
                imported++
            } catch (err) {
                skipped++
                console.error('Failed to import:', item.name, err)
            }
        }

        return {
            success: true,
            message: `Imported ${imported} colleges (${skipped} skipped)`,
            importedCount: imported
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Import failed'
        return { success: false, message }
    }
}

/**
 * Import colleges from CSV file
 */
export async function importCollegesFromCSV(
    client: SanityClient,
    file: File
): Promise<ImportResult> {
    try {
        const text = await file.text()

        // Use CSV parsing utilities
        const { parseCSV, validateRow } = await import('./csvImport')
        const parseResult = parseCSV(text)

        if (parseResult.errors.length > 0) {
            return {
                success: false,
                message: `CSV parsing errors:\n${parseResult.errors.join('\n')}`
            }
        }

        if (parseResult.rows.length === 0) {
            return { success: false, message: 'No data rows found in CSV' }
        }

        let imported = 0
        let updated = 0
        let skipped = 0
        const errors: string[] = []

        for (let i = 0; i < parseResult.rows.length; i++) {
            const row = parseResult.rows[i]
            const rowNum = i + 2 // +2 because of header row and 0-indexing

            try {
                // Validate row
                const validationErrors = validateRow(row)
                if (validationErrors.length > 0) {
                    errors.push(`Row ${rowNum}: ${validationErrors.join(', ')}`)
                    skipped++
                    continue
                }

                // Generate slug from name
                const slug = row.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')

                // Check if college already exists by name
                const existing = await client.fetch(
                    `*[_type == "college" && name == $name][0]`,
                    { name: row.name }
                )

                const collegeData = {
                    _type: 'college' as const,
                    name: row.name,
                    slug: { _type: 'slug' as const, current: slug },
                    location: row.location,
                    type: row.type as 'Government' | 'Private' | 'Semi-Govt',
                    estYear: row.estYear ? parseInt(row.estYear) : undefined,
                    website: row.website || undefined,
                    shortName: row.shortName || undefined,
                    isVisible: row.isVisible ? row.isVisible.toLowerCase() === 'true' : true,
                    description: row.description || undefined,
                    priority: 0
                }

                if (existing) {
                    // Update existing college
                    await client
                        .patch(existing._id)
                        .set(collegeData)
                        .commit()
                    updated++
                } else {
                    // Create new college
                    await client.create(collegeData)
                    imported++
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error'
                errors.push(`Row ${rowNum} (${row.name}): ${errorMsg}`)
                skipped++
            }
        }

        const summary = [
            `Imported: ${imported} new`,
            `Updated: ${updated} existing`,
            skipped > 0 ? `Skipped: ${skipped}` : null
        ].filter(Boolean).join(', ')

        return {
            success: true,
            message: errors.length > 0
                ? `${summary}\n\nErrors:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n...and ${errors.length - 10} more` : ''}`
                : summary,
            importedCount: imported + updated
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'CSV import failed'
        return { success: false, message }
    }
}

/**
 * Publish all draft college documents
 */
export async function publishAllDrafts(client: SanityClient): Promise<PublishResult> {
    try {
        const drafts = await client.fetch(`*[_type == "college" && _id in path("drafts.**")]`)

        if (!drafts || drafts.length === 0) {
            return { success: false, message: 'No drafts found' }
        }

        let published = 0
        for (const draft of drafts) {
            try {
                const docId = draft._id.replace('drafts.', '')
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id: _draftId, _rev: _draftRev, ...content } = draft

                await client.createOrReplace({
                    _id: docId,
                    ...content
                })

                await client.delete(draft._id)
                published++
            } catch (err) {
                console.error('Failed to publish:', draft._id, err)
            }
        }

        return {
            success: true,
            message: `Published ${published} drafts`,
            publishedCount: published
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Publish failed'
        return { success: false, message }
    }
}

/**
 * Validate all colleges and return issues
 */
export async function validateAllColleges(client: SanityClient): Promise<ValidationResult> {
    try {
        const colleges = await client.fetch(`*[_type == "college"]{
            _id,
            name,
            slug,
            location,
            type,
            logo,
            description,
            highlights,
            detailsIdentifier
        }`)

        const issues: ValidationIssue[] = []

        for (const college of colleges) {
            const collegeIssues: string[] = []

            if (!college.slug?.current) {
                collegeIssues.push('Missing URL slug')
            }
            if (!college.location) {
                collegeIssues.push('Missing location')
            }
            if (!college.type) {
                collegeIssues.push('Missing college type')
            }
            if (!college.logo) {
                collegeIssues.push('Missing logo')
            }
            if (!college.description) {
                collegeIssues.push('Missing meta description')
            }
            if (!college.highlights || college.highlights.length === 0) {
                collegeIssues.push('Missing highlights')
            }
            if (!college.detailsIdentifier) {
                collegeIssues.push('No detail source linked')
            }

            if (collegeIssues.length > 0) {
                issues.push({
                    collegeId: college._id,
                    collegeName: college.name,
                    issues: collegeIssues
                })
            }
        }

        return {
            success: true,
            message: issues.length === 0
                ? 'All colleges passed validation!'
                : `Found ${issues.length} colleges with issues`,
            issues
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Validation failed'
        return { success: false, message, issues: [] }
    }
}

/**
 * Rebuild all data by triggering revalidation webhook
 */
export async function rebuildAllData(includeCollections: string[]): Promise<RebuildResult> {
    try {
        const collections = includeCollections.join(',')
        const response = await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}&rebuild=all&collections=${collections}`)

        if (!response.ok) {
            throw new Error(`Rebuild failed: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            success: true,
            message: data.message || 'Rebuild triggered successfully'
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Rebuild failed'
        return { success: false, message }
    }
}
