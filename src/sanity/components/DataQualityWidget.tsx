// Data Quality Widget for Sanity Dashboard
// Shows comprehensive statistics and quality metrics for college data

'use client'

import { Stack, Text, Button, Box, Badge, Flex, TextInput, Card } from '@sanity/ui'
import { useState } from 'react'
import { useRouter } from 'sanity/router'
import { BarChart3, ChevronDown, ChevronUp, Activity, Eye, EyeOff, Building2, AlertCircle, Search, RefreshCw, ArrowRight } from 'lucide-react'
import { useSanityStats } from '../utils/hooks/useSanityStats'
import { WidgetCard, StatsGrid, ProgressBar, EmptyState, LoadingSkeleton } from './shared'

type ExpandedSection = 'synced' | 'missing' | 'incomplete' | 'noHighlights' | 'missingLogo'

export function DataQualityWidget() {
    const { loading, error, data, refetch } = useSanityStats()
    const router = useRouter()
    const [expandedSection, setExpandedSection] = useState<ExpandedSection | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const handleToggleSection = (section: ExpandedSection) => {
        setExpandedSection(prev => prev === section ? null : section)
    }

    const navigateToCollege = (id: string) => router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type: 'college' })

    const filterColleges = (colleges: { _id: string; name: string }[]) => {
        if (!searchTerm.trim()) return colleges
        return colleges.filter(college => college.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    const getQualityColor = (score: number): string => {
        if (score >= 80) return '#10b981'
        if (score >= 50) return '#f59e0b'
        return '#ef4444'
    }

    if (error) {
        return (
            <WidgetCard title="Data Quality" icon={<BarChart3 size={18} />} iconColor="#ef4444">
                <EmptyState title="Error loading data" description={error} />
                <Button text="Retry" onClick={refetch} mode="ghost" tone="critical" />
            </WidgetCard>
        )
    }

    if (!data) return null

    const { stats } = data

    return (
        <WidgetCard
            title="Data Quality"
            icon={<BarChart3 size={18} />}
            iconColor="#6366f1"
            headerGradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            collapsible
            actions={<Button icon={RefreshCw} onClick={refetch} mode="bleed" style={{ color: 'white' }} />}
        >
            {loading ? (
                <Stack space={4}>
                    {/* Quality Score Skeleton */}
                    <Box padding={4} style={{ background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12, textAlign: 'center' }}>
                        <LoadingSkeleton lines={3} showTitle />
                    </Box>
                    {/* Stats Grids Skeleton */}
                    <LoadingSkeleton lines={2} />
                    <LoadingSkeleton lines={2} />
                    <LoadingSkeleton lines={2} />
                    {/* Search Skeleton */}
                    <LoadingSkeleton lines={1} />
                    {/* Quality Issues Skeleton */}
                    <LoadingSkeleton lines={4} />
                </Stack>
            ) : (
                <Stack space={4}>
                    {/* Quality Score */}
                    <Box padding={4} style={{
                        background: `linear-gradient(135deg, ${getQualityColor(stats.qualityScore)}22, ${getQualityColor(stats.qualityScore)}11)`,
                        borderRadius: 12,
                        textAlign: 'center'
                    }}>
                        <Stack space={2}>
                            <BarChart3 size={28} style={{ margin: '0 auto', color: getQualityColor(stats.qualityScore) }} />
                            <Text size={4} weight="bold" style={{ color: getQualityColor(stats.qualityScore) }}>{stats.qualityScore}%</Text>
                            <Text size={1} muted>Overall Quality Score</Text>
                            <ProgressBar value={stats.qualityScore} color={getQualityColor(stats.qualityScore)} />
                        </Stack>
                    </Box>

                    {/* Overview Stats */}
                    <StatsGrid
                        columns={3}
                        stats={[
                            { label: 'Total', value: stats.total, icon: <Building2 size={14} /> },
                            { label: 'Visible', value: stats.visible, tone: 'positive', icon: <Eye size={14} /> },
                            { label: 'Hidden', value: stats.total - stats.visible, tone: 'caution', icon: <EyeOff size={14} /> }
                        ]}
                    />

                    <StatsGrid
                        columns={3}
                        stats={[
                            { label: 'Drafts', value: stats.drafts, tone: 'caution', icon: <AlertCircle size={14} /> },
                            { label: 'Synced (7d)', value: stats.synced, tone: 'positive' },
                            { label: 'Never Synced', value: stats.unsynced, tone: 'critical' }
                        ]}
                    />

                    <StatsGrid
                        columns={3}
                        stats={[
                            { label: 'Has Logo', value: stats.hasLogo, tone: 'positive' },
                            { label: 'Has Cover', value: stats.hasCover, tone: 'primary' },
                            { label: 'Complete Images', value: stats.hasBoth, tone: 'positive' }
                        ]}
                    />

                    {/* Search */}
                    <TextInput
                        icon={Search}
                        placeholder="Search colleges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        fontSize={1}
                    />

                    {/* Quality Issues */}
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Flex align="center" gap={2}>
                                <Activity size={14} />
                                <Text size={0} weight="semibold" muted>QUALITY ISSUES</Text>
                            </Flex>

                            {/* Recently Synced */}
                            <Card
                                padding={3}
                                tone={stats.synced > 0 ? 'positive' : 'default'}
                                style={{ cursor: stats.synced > 0 ? 'pointer' : 'default' }}
                                onClick={() => stats.synced > 0 && handleToggleSection('synced')}
                            >
                                <Flex justify="space-between" align="center">
                                    <Text size={1}>Recently Updated (7 days)</Text>
                                    <Flex align="center" gap={2}>
                                        <Badge tone="positive">{stats.synced}</Badge>
                                        {stats.synced > 0 && (expandedSection === 'synced' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </Flex>
                                </Flex>
                                {expandedSection === 'synced' && data.synced.length > 0 && (
                                    <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <Stack space={1}>
                                            {filterColleges(data.synced).slice(0, 8).map(item => (
                                                <Card
                                                    key={item._id}
                                                    padding={2}
                                                    radius={1}
                                                    tone="transparent"
                                                    as="button"
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        borderLeft: '3px solid transparent',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = '#10b981'
                                                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'
                                                    }}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = 'transparent'
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    <Flex align="center" justify="space-between">
                                                        <Text size={1}>{item.name}</Text>
                                                        <ArrowRight size={12} style={{ opacity: 0.4 }} />
                                                    </Flex>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Card>

                            {/* Incomplete Data */}
                            <Card
                                padding={3}
                                tone={stats.incomplete > 0 ? 'caution' : 'default'}
                                style={{ cursor: stats.incomplete > 0 ? 'pointer' : 'default' }}
                                onClick={() => stats.incomplete > 0 && handleToggleSection('incomplete')}
                            >
                                <Flex justify="space-between" align="center">
                                    <Flex align="center" gap={2}>
                                        <AlertCircle size={14} />
                                        <Text size={1}>Incomplete Data</Text>
                                    </Flex>
                                    <Flex align="center" gap={2}>
                                        <Badge tone={stats.incomplete > 0 ? 'caution' : 'default'}>{stats.incomplete}</Badge>
                                        {stats.incomplete > 0 && (expandedSection === 'incomplete' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </Flex>
                                </Flex>
                                {expandedSection === 'incomplete' && data.incomplete.length > 0 && (
                                    <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <Stack space={1}>
                                            {filterColleges(data.incomplete).slice(0, 8).map(item => (
                                                <Card
                                                    key={item._id}
                                                    padding={2}
                                                    radius={1}
                                                    tone="transparent"
                                                    as="button"
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        borderLeft: '3px solid transparent',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = '#f59e0b'
                                                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
                                                    }}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = 'transparent'
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    <Flex align="center" justify="space-between">
                                                        <Text size={1}>{item.name}</Text>
                                                        <ArrowRight size={12} style={{ opacity: 0.4 }} />
                                                    </Flex>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Card>

                            {/* Missing Logo */}
                            <Card
                                padding={3}
                                tone={stats.missingLogo > 0 ? 'critical' : 'default'}
                                style={{ cursor: stats.missingLogo > 0 ? 'pointer' : 'default' }}
                                onClick={() => stats.missingLogo > 0 && handleToggleSection('missingLogo')}
                            >
                                <Flex justify="space-between" align="center">
                                    <Text size={1}>Missing Logo</Text>
                                    <Flex align="center" gap={2}>
                                        <Badge tone={stats.missingLogo > 0 ? 'critical' : 'default'}>{stats.missingLogo}</Badge>
                                        {stats.missingLogo > 0 && (expandedSection === 'missingLogo' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </Flex>
                                </Flex>
                                {expandedSection === 'missingLogo' && data.missingLogo.length > 0 && (
                                    <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <Stack space={1}>
                                            {filterColleges(data.missingLogo).slice(0, 8).map(item => (
                                                <Card
                                                    key={item._id}
                                                    padding={2}
                                                    radius={1}
                                                    tone="transparent"
                                                    as="button"
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        borderLeft: '3px solid transparent',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = '#ef4444'
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
                                                    }}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = 'transparent'
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    <Flex align="center" justify="space-between">
                                                        <Text size={1}>{item.name}</Text>
                                                        <ArrowRight size={12} style={{ opacity: 0.4 }} />
                                                    </Flex>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Card>

                            {/* No Highlights */}
                            <Card
                                padding={3}
                                tone={stats.noHighlights > 0 ? 'caution' : 'default'}
                                style={{ cursor: stats.noHighlights > 0 ? 'pointer' : 'default' }}
                                onClick={() => stats.noHighlights > 0 && handleToggleSection('noHighlights')}
                            >
                                <Flex justify="space-between" align="center">
                                    <Text size={1}>Missing Highlights</Text>
                                    <Flex align="center" gap={2}>
                                        <Badge tone={stats.noHighlights > 0 ? 'caution' : 'default'}>{stats.noHighlights}</Badge>
                                        {stats.noHighlights > 0 && (expandedSection === 'noHighlights' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </Flex>
                                </Flex>
                                {expandedSection === 'noHighlights' && data.noHighlights.length > 0 && (
                                    <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <Stack space={1}>
                                            {filterColleges(data.noHighlights).slice(0, 8).map(item => (
                                                <Card
                                                    key={item._id}
                                                    padding={2}
                                                    radius={1}
                                                    tone="transparent"
                                                    as="button"
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        borderLeft: '3px solid transparent',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = '#f59e0b'
                                                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'
                                                    }}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                                        e.currentTarget.style.borderLeftColor = 'transparent'
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    <Flex align="center" justify="space-between">
                                                        <Text size={1}>{item.name}</Text>
                                                        <ArrowRight size={12} style={{ opacity: 0.4 }} />
                                                    </Flex>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Card>
                        </Stack>
                    </Box>
                </Stack>
            )}
        </WidgetCard>
    )
}
