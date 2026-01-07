// Analytics Dashboard Widget
// Displays key metrics and insights about college data

'use client'

import { Stack, Text, Grid, Badge, Flex, Box, Button } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { TrendingUp, Eye, EyeOff, Calendar, Award, Building2, MapPin, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, StatsGrid, ProgressBar } from './shared'

interface AnalyticsData {
    total: number
    visible: number
    hidden: number
    withDetails: number
    withoutDetails: number
    byType: { type: string; count: number }[]
    byLocation: { location: string; count: number }[]
    recentlyAdded: number // Last 30 days
    recentlyUpdated: number // Last 7 days
    completionRate: number // Percentage with all required fields
    avgQualityScore: number
}


interface AnalyticsCollege {
    _id: string
    _createdAt: string
    _updatedAt: string
    name: string
    type?: string
    location?: string
    isVisible?: boolean
    logo?: unknown
    description?: string
    detailsReference?: unknown
    highlights?: string[]
}

export function AnalyticsDashboardWidget() {
    const client = useClient({ apiVersion })
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<AnalyticsData | null>(null)


    const fetchAnalytics = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch all colleges with necessary fields
            const colleges = await client.fetch<AnalyticsCollege[]>(`
                *[_type == "college"] {
                    _id,
                    _createdAt,
                    _updatedAt,
                    name,
                    type,
                    location,
                    isVisible,
                    logo,
                    description,
                    detailsReference,
                    highlights
                }
            `)

            const now = new Date()
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

            // Calculate metrics
            const total = colleges.length
            const visible = colleges.filter(c => c.isVisible).length
            const hidden = total - visible
            const withDetails = colleges.filter(c => c.detailsReference).length
            const withoutDetails = total - withDetails

            // Recent activity
            const recentlyAdded = colleges.filter(c =>
                new Date(c._createdAt) > thirtyDaysAgo
            ).length
            const recentlyUpdated = colleges.filter(c =>
                new Date(c._updatedAt) > sevenDaysAgo
            ).length

            // By Type
            const typeMap = new Map<string, number>()
            colleges.forEach(c => {
                const type = c.type || 'Unknown'
                typeMap.set(type, (typeMap.get(type) || 0) + 1)
            })
            const byType = Array.from(typeMap.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count)

            // By Location
            const locationMap = new Map<string, number>()
            colleges.forEach(c => {
                const location = c.location || 'Unknown'
                locationMap.set(location, (locationMap.get(location) || 0) + 1)
            })
            const byLocation = Array.from(locationMap.entries())
                .map(([location, count]) => ({ location, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5) // Top 5 locations

            // Completion rate (colleges with logo, description, and highlights)
            const complete = colleges.filter(c =>
                c.logo && c.description && c.highlights && c.highlights.length > 0
            ).length
            const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0

            // Average quality score
            const qualityScores = colleges.map(c => {
                let score = 0
                if (c.logo) score += 25
                if (c.description) score += 25
                if (c.detailsReference) score += 25
                if (c.highlights && c.highlights.length > 0) score += 25
                return score
            })
            const avgQualityScore = qualityScores.length > 0
                ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
                : 0

            setData({
                total,
                visible,
                hidden,
                withDetails,
                withoutDetails,
                byType,
                byLocation,
                recentlyAdded,
                recentlyUpdated,
                completionRate,
                avgQualityScore
            })
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    return (
        <WidgetCard
            title="Analytics Dashboard"
            icon={<TrendingUp size={18} />}
            iconColor="#6366f1"
            loading={loading}
            collapsible
            headerGradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            actions={
                <Button
                    icon={RefreshCw}
                    mode="bleed"
                    onClick={fetchAnalytics}
                    style={{ color: 'white' }}
                />
            }
        >
            {data && (
                <Stack space={4}>
                    {/* Key Metrics */}
                    <StatsGrid
                        columns={4}
                        stats={[
                            { label: 'Total', value: data.total, tone: 'primary', icon: <Building2 size={16} /> },
                            { label: 'Visible', value: data.visible, tone: 'positive', icon: <Eye size={16} /> },
                            { label: 'Hidden', value: data.hidden, tone: 'caution', icon: <EyeOff size={16} /> },
                            { label: 'Quality', value: `${data.avgQualityScore}%`, icon: <Award size={16} /> }
                        ]}
                    />

                    {/* Activity Metrics */}
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">Recent Activity</Text>
                            <Grid columns={2} gap={2}>
                                <Flex align="center" gap={2}>
                                    <Calendar size={14} style={{ opacity: 0.5 }} />
                                    <Text size={1}>
                                        <Badge tone="positive">{data.recentlyAdded}</Badge> added (30d)
                                    </Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <Calendar size={14} style={{ opacity: 0.5 }} />
                                    <Text size={1}>
                                        <Badge tone="primary">{data.recentlyUpdated}</Badge> updated (7d)
                                    </Text>
                                </Flex>
                            </Grid>
                        </Stack>
                    </Box>

                    {/* Completion Rate */}
                    <Box padding={3} style={{
                        background: data.completionRate >= 80 ? 'rgba(16, 185, 129, 0.1)' : data.completionRate >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 8
                    }}>
                        <Stack space={2}>
                            <Flex justify="space-between" align="center">
                                <Text size={1} weight="semibold">Data Completion</Text>
                                <Text size={2} weight="bold">{data.completionRate}%</Text>
                            </Flex>
                            <ProgressBar
                                value={data.completionRate}
                                color={data.completionRate >= 80 ? '#10b981' : data.completionRate >= 50 ? '#f59e0b' : '#ef4444'}
                            />
                        </Stack>
                    </Box>

                    {/* Distribution */}
                    <Grid columns={2} gap={3}>
                        {/* By Type */}
                        <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <Stack space={2}>
                                <Text size={0} weight="semibold" muted>BY TYPE</Text>
                                {data.byType.map(({ type, count }) => (
                                    <Flex key={type} justify="space-between" align="center">
                                        <Text size={1}>{type}</Text>
                                        <Badge tone="primary">{count}</Badge>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>

                        {/* Top Locations */}
                        <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <Stack space={2}>
                                <Flex align="center" gap={1}>
                                    <MapPin size={12} />
                                    <Text size={0} weight="semibold" muted>TOP LOCATIONS</Text>
                                </Flex>
                                {data.byLocation.map(({ location, count }) => (
                                    <Flex key={location} justify="space-between" align="center">
                                        <Text size={1}>{location}</Text>
                                        <Badge tone="default">{count}</Badge>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                    </Grid>
                </Stack>
            )}
        </WidgetCard>
    )
}
