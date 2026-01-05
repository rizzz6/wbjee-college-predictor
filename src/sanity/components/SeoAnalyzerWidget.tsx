// SEO Analyzer Widget
// Analyzes and scores SEO quality of college content

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Grid, Select, Card } from '@sanity/ui'
import { useState, useEffect } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { Search, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, StatsGrid, EmptyState } from './shared'

interface SeoAnalysis {
    _id: string
    name: string
    slug?: { current: string }
    description?: string
    isVisible: boolean
    logo?: any
    coverImage?: any
    website?: string
    highlights?: string[]
    score: number
    issues: SeoIssue[]
}

interface SeoIssue {
    type: 'error' | 'warning' | 'info'
    message: string
    field: string
    suggestion?: string
}

interface SeoStats {
    total: number
    excellent: number
    good: number
    fair: number
    poor: number
    avgScore: number
}

export function SeoAnalyzerWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [analyses, setAnalyses] = useState<SeoAnalysis[]>([])
    const [stats, setStats] = useState<SeoStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'visible' | 'poor'>('all')
    const [sortBy, setSortBy] = useState<'score' | 'name'>('score')

    useEffect(() => {
        analyzeContent()
    }, [])

    const analyzeContent = async () => {
        setLoading(true)
        try {
            const colleges = await client.fetch(`
                *[_type == "college"] {
                    _id, name, slug, description, isVisible,
                    logo, coverImage, website, highlights
                }
            `)

            const analyzed = colleges.map(analyzeCollege)
            const scores = analyzed.map((a: SeoAnalysis) => a.score)
            const newStats: SeoStats = {
                total: analyzed.length,
                excellent: analyzed.filter((a: SeoAnalysis) => a.score >= 90).length,
                good: analyzed.filter((a: SeoAnalysis) => a.score >= 70 && a.score < 90).length,
                fair: analyzed.filter((a: SeoAnalysis) => a.score >= 50 && a.score < 70).length,
                poor: analyzed.filter((a: SeoAnalysis) => a.score < 50).length,
                avgScore: scores.length > 0
                    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
                    : 0
            }

            setAnalyses(analyzed)
            setStats(newStats)
        } catch (error) {
            console.error('SEO analysis failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const analyzeCollege = (college: any): SeoAnalysis => {
        const issues: SeoIssue[] = []
        let score = 100

        // Meta Description
        if (!college.description) {
            issues.push({ type: 'error', field: 'description', message: 'Missing description' })
            score -= 25
        } else if (college.description.length < 100) {
            issues.push({ type: 'warning', field: 'description', message: 'Description too short' })
            score -= 10
        }

        // Slug
        if (!college.slug?.current) {
            issues.push({ type: 'error', field: 'slug', message: 'Missing URL slug' })
            score -= 15
        }

        // Images
        if (!college.logo) {
            issues.push({ type: 'error', field: 'logo', message: 'Missing logo' })
            score -= 15
        }

        // Website
        if (college.website && !college.website.startsWith('https://')) {
            issues.push({ type: 'warning', field: 'website', message: 'Not using HTTPS' })
            score -= 3
        }

        // Highlights
        if (!college.highlights || college.highlights.length === 0) {
            issues.push({ type: 'warning', field: 'highlights', message: 'No highlights' })
            score -= 10
        }

        return { ...college, score: Math.max(0, score), issues }
    }

    const getScoreColor = (score: number): string => {
        if (score >= 90) return '#10b981'
        if (score >= 70) return '#3b82f6'
        if (score >= 50) return '#f59e0b'
        return '#ef4444'
    }

    const getScoreTone = (score: number): 'positive' | 'primary' | 'caution' | 'critical' => {
        if (score >= 90) return 'positive'
        if (score >= 70) return 'primary'
        if (score >= 50) return 'caution'
        return 'critical'
    }

    const navigateToCollege = (id: string) => {
        router.navigateUrl({ path: `/desk/college;${id}` })
    }

    const filteredAnalyses = analyses
        .filter(a => {
            if (filter === 'visible') return a.isVisible
            if (filter === 'poor') return a.score < 70
            return true
        })
        .sort((a, b) => sortBy === 'score' ? a.score - b.score : a.name.localeCompare(b.name))

    return (
        <WidgetCard
            title="SEO Analyzer"
            icon={<Search size={18} />}
            iconColor="#10b981"
            headerGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            loading={loading}
            collapsible
            actions={
                <Button
                    icon={RefreshCw}
                    onClick={analyzeContent}
                    disabled={loading}
                    mode="bleed"
                    style={{ color: 'white' }}
                />
            }
            footer={stats && (
                <Text size={0} muted style={{ textAlign: 'center' }}>
                    {analyses.filter(a => a.score >= 70).length}/{analyses.length} with good SEO
                </Text>
            )}
        >
            <Stack space={4}>
                {/* Stats */}
                {stats && (
                    <StatsGrid
                        columns={5}
                        stats={[
                            { label: 'Average', value: `${stats.avgScore}%`, tone: getScoreTone(stats.avgScore) as any },
                            { label: '90+', value: stats.excellent, tone: 'positive' },
                            { label: '70-89', value: stats.good, tone: 'primary' },
                            { label: '50-69', value: stats.fair, tone: 'caution' },
                            { label: '<50', value: stats.poor, tone: 'critical' }
                        ]}
                    />
                )}

                {/* Filters */}
                <Flex gap={2}>
                    <Box flex={1}>
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.currentTarget.value as any)}
                            fontSize={1}
                        >
                            <option value="all">All ({analyses.length})</option>
                            <option value="visible">Visible Only</option>
                            <option value="poor">Needs Work (&lt;70)</option>
                        </Select>
                    </Box>
                    <Box flex={1}>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.currentTarget.value as any)}
                            fontSize={1}
                        >
                            <option value="score">Score (Low First)</option>
                            <option value="name">Name</option>
                        </Select>
                    </Box>
                </Flex>

                {/* Results */}
                <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredAnalyses.length > 0 ? (
                        <Stack space={2}>
                            {filteredAnalyses.map(analysis => (
                                <Card key={analysis._id} padding={3} border radius={2}>
                                    <Stack space={2}>
                                        <Flex justify="space-between" align="center">
                                            <Stack space={1}>
                                                <Text size={1} weight="semibold">{analysis.name}</Text>
                                                <Flex gap={1}>
                                                    <Badge tone={getScoreTone(analysis.score)}>{analysis.score}%</Badge>
                                                    {analysis.isVisible && <Badge tone="positive" fontSize={0}>Visible</Badge>}
                                                </Flex>
                                            </Stack>
                                            <Button text="Fix" mode="ghost" onClick={() => navigateToCollege(analysis._id)} fontSize={0} />
                                        </Flex>
                                        {analysis.issues.length > 0 && (
                                            <Stack space={1}>
                                                {analysis.issues.slice(0, 2).map((issue, idx) => (
                                                    <Flex key={idx} align="center" gap={2}>
                                                        {issue.type === 'error' && <XCircle size={12} style={{ color: '#ef4444' }} />}
                                                        {issue.type === 'warning' && <AlertTriangle size={12} style={{ color: '#f59e0b' }} />}
                                                        {issue.type === 'info' && <CheckCircle size={12} style={{ color: '#3b82f6' }} />}
                                                        <Text size={0} muted>{issue.message}</Text>
                                                    </Flex>
                                                ))}
                                                {analysis.issues.length > 2 && (
                                                    <Text size={0} muted>+{analysis.issues.length - 2} more</Text>
                                                )}
                                            </Stack>
                                        )}
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState title="No results" description="Try changing the filter" />
                    )}
                </Box>
            </Stack>
        </WidgetCard>
    )
}
