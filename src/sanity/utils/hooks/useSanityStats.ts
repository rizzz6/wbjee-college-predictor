'use client'

import { useEffect, useState, useCallback } from 'react'
import { useClient } from 'sanity'
import { apiVersion } from '../../env'

export interface CollegeStats {
    total: number
    published: number
    visible: number
    drafts: number
    synced: number
    unsynced: number
    incomplete: number
    noHighlights: number
    hasLogo: number
    hasCover: number
    hasBoth: number
    missingLogo: number
    missingCover: number
    missingBoth: number
    govt: number
    private: number
    qualityScore: number
}

export interface CollegeItem {
    _id: string
    name: string
}

// Internal type for college data from GROQ query
interface CollegeData {
    _id: string
    name: string
    isVisible?: boolean
    lastSyncedAt?: string
    detailsIdentifier?: unknown
    description?: string
    body?: unknown
    fees?: unknown
    feeStructure?: unknown
    placements?: unknown
    highlights?: string[]
    logo?: unknown
    coverImage?: unknown
    type?: string
}

export interface StatsData {
    stats: CollegeStats
    synced: CollegeItem[]
    missing: CollegeItem[]
    unsynced: CollegeItem[]
    incomplete: CollegeItem[]
    noHighlights: CollegeItem[]
    missingLogo: CollegeItem[]
    missingCover: CollegeItem[]
    missingBoth: CollegeItem[]
}

/**
 * Custom hook to fetch and manage Sanity college statistics
 */
export function useSanityStats() {
    const client = useClient({ apiVersion })
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<StatsData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const colleges = await client.fetch(`*[_type == "college"]{
                _id,
                _rev,
                name,
                logo,
                coverImage,
                highlights,
                detailsIdentifier,
                isVisible,
                type,
                lastSyncedAt,
                description,
                body,
                fees,
                feeStructure,
                placements,
                slug
            }`)

            // Calculate statistics
            const total = colleges.length
            const published = colleges.filter((c: CollegeData) => !c._id.startsWith('drafts.')).length
            const visible = colleges.filter((c: CollegeData) => c.isVisible === true).length
            const drafts = total - published

            const ONE_WEEK = 7 * 24 * 60 * 60 * 1000
            const synced = colleges.filter((c: CollegeData) =>
                c.lastSyncedAt && (Date.now() - new Date(c.lastSyncedAt).getTime()) < ONE_WEEK
            )

            const unsynced = colleges.filter((c: CollegeData) => !c.lastSyncedAt)

            const missing = colleges.filter((c: CollegeData) => !c.detailsIdentifier)

            const incomplete = colleges.filter((c: CollegeData) => {
                const hasBasic = c.description && c.body
                const hasData = c.fees || c.feeStructure || c.placements
                return !hasBasic || !hasData
            })

            const noHighlights = colleges.filter((c: CollegeData) =>
                !c.highlights || c.highlights.length === 0
            )

            const hasLogo = colleges.filter((c: CollegeData) => c.logo).length
            const hasCover = colleges.filter((c: CollegeData) => c.coverImage).length
            const hasBoth = colleges.filter((c: CollegeData) => c.logo && c.coverImage).length

            const missingLogo = colleges.filter((c: CollegeData) => !c.logo)
            const missingCover = colleges.filter((c: CollegeData) => !c.coverImage)
            const missingBoth = colleges.filter((c: CollegeData) => !c.logo && !c.coverImage)

            const govt = colleges.filter((c: CollegeData) => c.type === 'Government').length
            const privateCount = colleges.filter((c: CollegeData) => c.type === 'Private').length

            // Calculate quality score
            let qualityScore = 0
            if (total > 0) {
                const weights = {
                    hasLogo: 15,
                    hasCover: 10,
                    hasHighlights: 15,
                    hasDescription: 10,
                    hasData: 20,
                    isSynced: 15,
                    hasDetailSource: 15
                }

                colleges.forEach((c: CollegeData) => {
                    let score = 0
                    if (c.logo) score += weights.hasLogo
                    if (c.coverImage) score += weights.hasCover
                    if (c.highlights && c.highlights.length > 0) score += weights.hasHighlights
                    if (c.description) score += weights.hasDescription
                    if (c.fees || c.feeStructure || c.placements) score += weights.hasData
                    if (c.lastSyncedAt && (Date.now() - new Date(c.lastSyncedAt).getTime()) < ONE_WEEK) {
                        score += weights.isSynced
                    }
                    if (c.detailsIdentifier) score += weights.hasDetailSource
                    qualityScore += score
                })
                qualityScore = Math.round(qualityScore / total)
            }

            const stats: CollegeStats = {
                total,
                published,
                visible,
                drafts,
                synced: synced.length,
                unsynced: unsynced.length,
                incomplete: incomplete.length,
                noHighlights: noHighlights.length,
                hasLogo,
                hasCover,
                hasBoth,
                missingLogo: missingLogo.length,
                missingCover: missingCover.length,
                missingBoth: missingBoth.length,
                govt,
                private: privateCount,
                qualityScore
            }

            setData({
                stats,
                synced: synced.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                missing: missing.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                unsynced: unsynced.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                incomplete: incomplete.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                noHighlights: noHighlights.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                missingLogo: missingLogo.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                missingCover: missingCover.map((c: CollegeData) => ({ _id: c._id, name: c.name })),
                missingBoth: missingBoth.map((c: CollegeData) => ({ _id: c._id, name: c.name }))
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch stats'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        loading,
        error,
        data,
        refetch: fetchStats
    }
}
