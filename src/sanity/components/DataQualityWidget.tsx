// Data Quality Widget for Sanity Dashboard
// Shows comprehensive statistics and quality metrics for college data

'use client'

import { Card, Stack, Heading, Text, Grid, Badge, Spinner, Button, Box, TextInput } from '@sanity/ui'
import { useState } from 'react'
import { useRouter } from 'sanity/router'
import { BarChart3, ChevronDown, ChevronUp, Edit, Activity, Image, ImageIcon, Building2, AlertCircle, Search } from 'lucide-react'
import { useSanityStats } from '../utils/hooks/useSanityStats'

type ExpandedSection =
    | 'synced'
    | 'missing'
    | 'unsynced'
    | 'incomplete'
    | 'noHighlights'
    | 'missingLogo'
    | 'missingCover'
    | 'missingBoth'

export function DataQualityWidget() {
    const { loading, error, data, refetch } = useSanityStats()
    const router = useRouter()
    const [expandedSection, setExpandedSection] = useState<ExpandedSection | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const handleToggleSection = (section: ExpandedSection) => {
        setExpandedSection(prev => prev === section ? null : section)
    }

    const navigateToCollege = (id: string) => {
        router.navigateUrl({
            path: `/desk/college;${id}`
        })
    }

    // Filter colleges by search term
    const filterColleges = (colleges: any[]) => {
        if (!searchTerm.trim()) return colleges
        return colleges.filter(college =>
            college.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    if (loading) {
        return (
            <Card padding={4}>
                <Stack space={3}>
                    <Spinner />
                    <Text size={1} muted>Loading quality metrics...</Text>
                </Stack>
            </Card>
        )
    }

    if (error) {
        return (
            <Card padding={4} tone="critical">
                <Stack space={2}>
                    <Text size={1} weight="semibold">Error loading quality data</Text>
                    <Text size={1}>{error}</Text>
                    <Button text="Retry" onClick={refetch} mode="ghost" tone="critical" />
                </Stack>
            </Card>
        )
    }

    if (!data) return null

    const { stats } = data

    // Calculate quality score color
    const getQualityTone = (score: number): 'positive' | 'caution' | 'critical' => {
        if (score >= 80) return 'positive'
        if (score >= 50) return 'caution'
        return 'critical'
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header with Overall Quality */}
                <Box>
                    <Stack space={2}>
                        <Heading size={1}>Data Quality</Heading>
                        <Card padding={3} tone={getQualityTone(stats.qualityScore)}>
                            <Stack space={2}>
                                <Box style={{ textAlign: 'center' }}>
                                    <BarChart3 size={32} style={{ margin: '0 auto' }} />
                                </Box>
                                <Text size={4} weight="bold" style={{ textAlign: 'center' }}>{stats.qualityScore}%</Text>
                                <Text size={1} style={{ textAlign: 'center' }}>Overall Quality Score</Text>
                            </Stack>
                        </Card>
                    </Stack>
                </Box>

                {/* Overview Statistics */}
                <Box>
                    <Text size={1} weight="semibold" style={{ marginBottom: 8 }}>Overview</Text>
                    <Grid columns={[2, 2, 3]} gap={2}>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Total Colleges</Text>
                                <Text size={3} weight="bold">{stats.total}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Published</Text>
                                <Text size={3} weight="bold">{stats.published}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Visible</Text>
                                <Text size={3} weight="bold">{stats.visible}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Drafts</Text>
                                <Text size={3} weight="bold">{stats.drafts}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Government</Text>
                                <Text size={3} weight="bold">{stats.govt}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} border>
                            <Stack space={1}>
                                <Text size={0} muted>Private</Text>
                                <Text size={3} weight="bold">{stats.private}</Text>
                            </Stack>
                        </Card>
                    </Grid>
                </Box>

                {/* Search Box */}
                <Box>
                    <TextInput
                        icon={Search}
                        placeholder="Search colleges in lists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        fontSize={1}
                    />
                </Box>

                {/* Sync Status */}
                <Box>
                    <Text size={1} weight="semibold" style={{ marginBottom: 8 }}>
                        <Activity size={14} style={{ display: 'inline', marginRight: 4 }} />
                        Sync Status
                    </Text>
                    <Stack space={2}>
                        {/* Recently Synced */}
                        <Card
                            padding={3}
                            tone={stats.synced > 0 ? 'positive' : 'default'}
                            style={{ cursor: stats.synced > 0 ? 'pointer' : 'default' }}
                            onClick={() => stats.synced > 0 && handleToggleSection('synced')}
                        >
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1}>Recently Synced (7 days)</Text>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Badge tone="positive">{stats.synced}</Badge>
                                    {stats.synced > 0 && (expandedSection === 'synced' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Box>
                            </Box>
                            {expandedSection === 'synced' && data.synced.length > 0 && (
                                <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Stack space={2}>
                                        {filterColleges(data.synced).slice(0, 10).map(item => (
                                            <Card
                                                key={item._id}
                                                padding={2}
                                                border
                                                radius={2}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigateToCollege(item._id)
                                                }}
                                            >
                                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Box style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            background: '#43c463'
                                                        }} />
                                                        <Text size={1}>{item.name}</Text>
                                                    </Box>
                                                    <Edit size={14} style={{ opacity: 0.5 }} />
                                                </Box>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Card>

                        {/* Never Synced */}
                        <Card
                            padding={3}
                            tone={stats.unsynced > 0 ? 'caution' : 'default'}
                            style={{ cursor: stats.unsynced > 0 ? 'pointer' : 'default' }}
                            onClick={() => stats.unsynced > 0 && handleToggleSection('unsynced')}
                        >
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1}>Never Synced</Text>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Badge tone="caution">{stats.unsynced}</Badge>
                                    {stats.unsynced > 0 && (expandedSection === 'unsynced' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Box>
                            </Box>
                            {expandedSection === 'unsynced' && data.unsynced.length > 0 && (
                                <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Stack space={2}>
                                        {filterColleges(data.unsynced).slice(0, 10).map(item => (
                                            <Card
                                                key={item._id}
                                                padding={2}
                                                border
                                                radius={2}
                                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                                onClick={(e) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                            >
                                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#f6ad55' }} />
                                                        <Text size={1}>{item.name}</Text>
                                                    </Box>
                                                    <Edit size={14} style={{ opacity: 0.5 }} />
                                                </Box>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Card>

                        {/* No Detail Source */}
                        <Card
                            padding={3}
                            tone={data.missing.length > 0 ? 'critical' : 'default'}
                            style={{ cursor: data.missing.length > 0 ? 'pointer' : 'default' }}
                            onClick={() => data.missing.length > 0 && handleToggleSection('missing')}
                        >
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1}>No Detail Source</Text>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Badge tone="critical">{data.missing.length}</Badge>
                                    {data.missing.length > 0 && (expandedSection === 'missing' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Box>
                            </Box>
                            {expandedSection === 'missing' && data.missing.length > 0 && (
                                <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Stack space={2}>
                                        {filterColleges(data.missing).slice(0, 10).map(item => (
                                            <Card
                                                key={item._id}
                                                padding={2}
                                                border
                                                radius={2}
                                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                                onClick={(e) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                            >
                                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#fc8181' }} />
                                                        <Text size={1}>{item.name}</Text>
                                                    </Box>
                                                    <Edit size={14} style={{ opacity: 0.5 }} />
                                                </Box>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Card>
                    </Stack>
                </Box>

                {/* Content Quality */}
                <Box>
                    <Text size={1} weight="semibold" style={{ marginBottom: 8 }}>
                        <Building2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                        Content Quality
                    </Text>
                    <Stack space={2}>
                        {/* Missing Highlights */}
                        <Card
                            padding={3}
                            tone={stats.noHighlights > 0 ? 'caution' : 'default'}
                            style={{ cursor: stats.noHighlights > 0 ? 'pointer' : 'default' }}
                            onClick={() => stats.noHighlights > 0 && handleToggleSection('noHighlights')}
                        >
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1}>Missing Highlights</Text>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Badge tone={stats.noHighlights > 0 ? 'caution' : 'default'}>{stats.noHighlights}</Badge>
                                    {stats.noHighlights > 0 && (expandedSection === 'noHighlights' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Box>
                            </Box>
                            {expandedSection === 'noHighlights' && data.noHighlights.length > 0 && (
                                <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Stack space={2}>
                                        {filterColleges(data.noHighlights).slice(0, 10).map(item => (
                                            <Card
                                                key={item._id}
                                                padding={2}
                                                border
                                                radius={2}
                                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                                onClick={(e) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                            >
                                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#f6ad55' }} />
                                                        <Text size={1}>{item.name}</Text>
                                                    </Box>
                                                    <Edit size={14} style={{ opacity: 0.5 }} />
                                                </Box>
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
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1}>Incomplete Data</Text>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Badge tone={stats.incomplete > 0 ? 'caution' : 'default'}>{stats.incomplete}</Badge>
                                    {stats.incomplete > 0 && (expandedSection === 'incomplete' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Box>
                            </Box>
                            {expandedSection === 'incomplete' && data.incomplete.length > 0 && (
                                <Box marginTop={3} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Stack space={2}>
                                        {filterColleges(data.incomplete).slice(0, 10).map(item => (
                                            <Card
                                                key={item._id}
                                                padding={2}
                                                border
                                                radius={2}
                                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                                onClick={(e) => { e.stopPropagation(); navigateToCollege(item._id) }}
                                            >
                                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#f6ad55' }} />
                                                        <Text size={1}>{item.name}</Text>
                                                    </Box>
                                                    <Edit size={14} style={{ opacity: 0.5 }} />
                                                </Box>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Card>
                    </Stack>
                </Box>

                {/* Media Assets */}
                <Box>
                    <Text size={1} weight="semibold" style={{ marginBottom: 8 }}>
                        <ImageIcon size={14} style={{ display: 'inline', marginRight: 4 }} />
                        Media Assets
                    </Text>
                    <Grid columns={2} gap={2}>
                        <Card padding={3} tone="transparent" border>
                            <Stack space={1}>
                                <Text size={0} muted>Has Logo</Text>
                                <Text size={2} weight="bold">{stats.hasLogo}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} tone="transparent" border>
                            <Stack space={1}>
                                <Text size={0} muted>Has Cover</Text>
                                <Text size={2} weight="bold">{stats.hasCover}</Text>
                            </Stack>
                        </Card>
                        <Card padding={3} tone="transparent" border>
                            <Stack space={1}>
                                <Text size={0} muted>Has Both</Text>
                                <Text size={2} weight="bold">{stats.hasBoth}</Text>
                            </Stack>
                        </Card>
                        <Card
                            padding={3}
                            tone={stats.missingBoth > 0 ? 'critical' : 'default'}
                            style={{ cursor: stats.missingBoth > 0 ? 'pointer' : 'default' }}
                            onClick={() => stats.missingBoth > 0 && handleToggleSection('missingBoth')}
                        >
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack space={1}>
                                    <Text size={0} muted>Missing Both</Text>
                                    <Text size={2} weight="bold">{stats.missingBoth}</Text>
                                </Stack>
                                {stats.missingBoth > 0 && (expandedSection === 'missingBoth' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </Box>
                        </Card>
                    </Grid>
                    {expandedSection === 'missingBoth' && data.missingBoth.length > 0 && (
                        <Box marginTop={2} style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {filterColleges(data.missingBoth).slice(0, 10).map(item => (
                                <Button
                                    key={item._id}
                                    mode="bleed"
                                    text={item.name}
                                    icon={Edit}
                                    fontSize={0}
                                    onClick={() => navigateToCollege(item._id)}
                                    style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Refresh Button */}
                <Button
                    mode="ghost"
                    text="Refresh Stats"
                    onClick={refetch}
                    icon={Activity}
                    fontSize={1}
                />
            </Stack>
        </Card>
    )
}
