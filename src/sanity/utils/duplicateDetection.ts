/**
 * Duplicate Detection System
 * Identifies potential duplicate college entries using fuzzy matching
 */

import { SanityClient } from '@sanity/client'

export interface DuplicateMatch {
    college1: {
        _id: string
        name: string
        location: string
        type: string
    }
    college2: {
        _id: string
        name: string
        location: string
        type: string
    }
    similarity: number // 0-100
    reasons: string[]
}

export interface DuplicateGroup {
    colleges: Array<{
        _id: string
        name: string
        location: string
        type: string
        isVisible: boolean
    }>
    similarity: number
    suggestedPrimary: string // ID of suggested college to keep
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()

    if (s1 === s2) return 100

    const len1 = s1.length
    const len2 = s2.length

    if (len1 === 0 || len2 === 0) return 0

    // Levenshtein distance matrix
    const matrix: number[][] = []

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            )
        }
    }

    const distance = matrix[len1][len2]
    const maxLen = Math.max(len1, len2)
    const similarity = ((maxLen - distance) / maxLen) * 100

    return Math.round(similarity)
}

/**
 * Normalize college name for comparison
 */
function normalizeName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\b(college|university|institute|of|engineering|management|technology|science)\b/g, '')
        .trim()
}

/**
 * Check if two colleges are potential duplicates
 */
function arePotentialDuplicates(
    college1: any,
    college2: any,
    threshold: number = 70
): DuplicateMatch | null {
    const reasons: string[] = []
    let totalSimilarity = 0
    let factorCount = 0

    // 1. Name similarity (most important)
    const nameSimilarity = calculateSimilarity(
        normalizeName(college1.name),
        normalizeName(college2.name)
    )

    if (nameSimilarity >= threshold) {
        reasons.push(`Name similarity: ${nameSimilarity}%`)
        totalSimilarity += nameSimilarity * 2 // Double weight
        factorCount += 2
    } else if (nameSimilarity < 50) {
        // Names too different, not a duplicate
        return null
    }

    // 2. Location similarity
    if (college1.location && college2.location) {
        const locationSimilarity = calculateSimilarity(
            college1.location.toLowerCase(),
            college2.location.toLowerCase()
        )

        if (locationSimilarity >= 80) {
            reasons.push(`Same location: ${college1.location}`)
            totalSimilarity += locationSimilarity
            factorCount++
        }
    }

    // 3. Same type
    if (college1.type === college2.type) {
        reasons.push(`Same type: ${college1.type}`)
        totalSimilarity += 100
        factorCount++
    }

    // 4. Check for common abbreviations
    if (college1.shortName && college2.shortName) {
        if (college1.shortName.toLowerCase() === college2.shortName.toLowerCase()) {
            reasons.push(`Same acronym: ${college1.shortName}`)
            totalSimilarity += 100
            factorCount++
        }
    }

    // 5. Website similarity
    if (college1.website && college2.website) {
        const domain1 = extractDomain(college1.website)
        const domain2 = extractDomain(college2.website)

        if (domain1 === domain2) {
            reasons.push(`Same website domain: ${domain1}`)
            totalSimilarity += 100
            factorCount++
        }
    }

    // Calculate average similarity
    const avgSimilarity = factorCount > 0 ? Math.round(totalSimilarity / factorCount) : 0

    if (avgSimilarity >= threshold && reasons.length >= 2) {
        return {
            college1: {
                _id: college1._id,
                name: college1.name,
                location: college1.location,
                type: college1.type
            },
            college2: {
                _id: college2._id,
                name: college2.name,
                location: college2.location,
                type: college2.type
            },
            similarity: avgSimilarity,
            reasons
        }
    }

    return null
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url)
        return urlObj.hostname.replace('www.', '')
    } catch {
        return url
    }
}

/**
 * Find all potential duplicates in the database
 */
export async function findDuplicates(
    client: SanityClient,
    threshold: number = 70
): Promise<DuplicateMatch[]> {
    // Fetch all colleges
    const colleges = await client.fetch(`
        *[_type == "college"] {
            _id, name, location, type, shortName, website, isVisible
        }
    `)

    const duplicates: DuplicateMatch[] = []
    const checked = new Set<string>()

    // Compare each college with every other college
    for (let i = 0; i < colleges.length; i++) {
        for (let j = i + 1; j < colleges.length; j++) {
            const pairKey = [colleges[i]._id, colleges[j]._id].sort().join('-')

            if (checked.has(pairKey)) continue
            checked.add(pairKey)

            const match = arePotentialDuplicates(colleges[i], colleges[j], threshold)
            if (match) {
                duplicates.push(match)
            }
        }
    }

    // Sort by similarity (highest first)
    return duplicates.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Group duplicates together
 */
export function groupDuplicates(matches: DuplicateMatch[]): DuplicateGroup[] {
    const groups: Map<string, Set<string>> = new Map()

    // Build groups
    matches.forEach(match => {
        const id1 = match.college1._id
        const id2 = match.college2._id

        // Find existing group
        let foundGroup: Set<string> | null = null
        for (const [key, group] of groups.entries()) {
            if (group.has(id1) || group.has(id2)) {
                foundGroup = group
                break
            }
        }

        if (foundGroup) {
            foundGroup.add(id1)
            foundGroup.add(id2)
        } else {
            const newGroup = new Set([id1, id2])
            groups.set(id1, newGroup)
        }
    })

    // Convert to array format
    const result: DuplicateGroup[] = []
    const processed = new Set<string>()

    for (const [key, group] of groups.entries()) {
        if (processed.has(key)) continue

        const groupIds = Array.from(group)
        groupIds.forEach(id => processed.add(id))

        // Find colleges in this group
        const groupColleges = matches
            .filter(m => groupIds.includes(m.college1._id) || groupIds.includes(m.college2._id))
            .flatMap(m => [
                { ...m.college1, isVisible: false }, // Add isVisible property
                { ...m.college2, isVisible: false }
            ])
            .filter((c, i, arr) => arr.findIndex(x => x._id === c._id) === i)

        // Calculate average similarity
        const relevantMatches = matches.filter(m =>
            groupIds.includes(m.college1._id) && groupIds.includes(m.college2._id)
        )
        const avgSimilarity = relevantMatches.length > 0
            ? Math.round(relevantMatches.reduce((sum, m) => sum + m.similarity, 0) / relevantMatches.length)
            : 0

        // Suggest primary (prefer visible, then alphabetically first)
        const suggested = groupColleges.sort((a, b) => {
            if (a.isVisible !== b.isVisible) return a.isVisible ? -1 : 1
            return a.name.localeCompare(b.name)
        })[0]

        result.push({
            colleges: groupColleges as any,
            similarity: avgSimilarity,
            suggestedPrimary: suggested._id
        })
    }

    return result.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Merge duplicate colleges
 */
export async function mergeDuplicates(
    client: SanityClient,
    primaryId: string,
    duplicateIds: string[]
): Promise<{ success: boolean; message: string }> {
    try {
        // Fetch primary college
        const primary = await client.getDocument(primaryId)
        if (!primary) {
            return { success: false, message: 'Primary college not found' }
        }

        // Fetch duplicates
        const duplicates = await Promise.all(
            duplicateIds.map(id => client.getDocument(id))
        )

        // Merge data (keep primary, fill in missing fields from duplicates)
        const merged: any = { ...primary }

        duplicates.forEach(dup => {
            if (!dup) return

            // Fill in missing fields
            Object.keys(dup).forEach(key => {
                if (key.startsWith('_')) return // Skip system fields
                if (!merged[key] && dup[key]) {
                    merged[key] = dup[key]
                }
            })
        })

        // Update primary with merged data
        await client.patch(primaryId).set(merged).commit()

        // Delete duplicates
        const transaction = client.transaction()
        duplicateIds.forEach(id => {
            transaction.delete(id)
        })
        await transaction.commit()

        return {
            success: true,
            message: `Merged ${duplicateIds.length} duplicate(s) into ${primary.name}`
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, message: `Merge failed: ${message}` }
    }
}
