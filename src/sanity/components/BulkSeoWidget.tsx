'use client'

import { Stack, Text, TextArea, Button, Box, Select, Badge, Flex, Card } from '@sanity/ui'
import { useState, useEffect } from 'react'
import { useClient } from 'sanity'
import { Sparkles, Eye, Play, CheckCircle2, XCircle } from 'lucide-react'
import {
    AVAILABLE_VARIABLES,
    processTemplate,
    validateTemplate,
    getProcessedLength
} from '../utils/templateEngine'
import {
    bulkUpdateSeoDescriptions,
    fetchCollegesForPreview,
    getCollegeCount,
    type BulkUpdateProgress,
    type BulkUpdateResult
} from '../utils/bulkUpdate'
import { apiVersion } from '../env'
import { WidgetCard, ProgressBar } from './shared'

export function BulkSeoWidget() {
    const client = useClient({ apiVersion })

    const [template, setTemplate] = useState('')
    const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
    interface PreviewItem {
        _id: string
        name: string
        old: string
        new: string
        isVisible?: boolean
    }

    const [preview, setPreview] = useState<PreviewItem[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [updating, setUpdating] = useState(false)
    const [progress, setProgress] = useState<BulkUpdateProgress>({ current: 0, total: 0 })
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<BulkUpdateResult[]>([])

    useEffect(() => { getCollegeCount(client, filter).then(setTotalCount) }, [filter, client])

    const validation = template ? validateTemplate(template) : { valid: false, errors: [], warnings: [] }
    const lengths = template ? getProcessedLength(template) : null

    const handlePreview = async () => {
        if (!validation.valid) return
        try {
            const colleges = await fetchCollegesForPreview(client, filter, 10)
            const previewed = colleges.map(c => ({
                _id: c._id, name: c.name, old: c.description || '(empty)',
                new: processTemplate(template, c), isVisible: c.isVisible
            }))
            setPreview(previewed)
            setShowResults(false)
        } catch {
            alert('Preview failed')
        }
    }

    const handleApply = async () => {
        if (!validation.valid) return
        if (!window.confirm(`Apply SEO descriptions to ${totalCount} colleges?`)) return

        setUpdating(true)
        setProgress({ current: 0, total: totalCount })
        setShowResults(false)

        try {
            const baseQuery = '_type == "college"'
            const filterQuery = filter === 'all' ? baseQuery : `${baseQuery} && isVisible == ${filter === 'visible'}`
            const ids = await client.fetch(`*[${filterQuery}]._id`)
            const updateResults = await bulkUpdateSeoDescriptions(client, ids, template, (prog) => setProgress(prog))

            setResults(updateResults)
            setShowResults(true)
        } catch {
            alert('Bulk update failed')
        } finally {
            setUpdating(false)
        }
    }

    const insertVariable = (variable: string) => setTemplate(prev => prev + variable)
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return (
        <WidgetCard
            title="Bulk SEO Update"
            icon={<Sparkles size={18} />}
            iconColor="#ec4899"
            headerGradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            collapsible
        >
            <Stack space={4}>
                {/* Available Variables */}
                <Box padding={3} style={{ background: 'rgba(236, 72, 153, 0.1)', borderRadius: 8 }}>
                    <Stack space={2}>
                        <Text size={0} weight="semibold" muted>AVAILABLE VARIABLES</Text>
                        <Flex gap={1} wrap="wrap">
                            {AVAILABLE_VARIABLES.map(v => (
                                <Badge key={v.key} tone="primary" style={{ cursor: 'pointer' }} onClick={() => insertVariable(v.key)}>
                                    {v.key}
                                </Badge>
                            ))}
                        </Flex>
                        <Text size={0} muted>Click to insert</Text>
                    </Stack>
                </Box>

                {/* Quick Templates */}
                <Select
                    value=""
                    onChange={(e) => { if (e.currentTarget.value) setTemplate(e.currentTarget.value) }}
                    fontSize={1}
                >
                    <option value="">Select template...</option>
                    <option value='"{college.name} - Best {college.type} College in {college.location} | WBJEE 2026"'>Standard</option>
                    <option value='"{college.name} ({college.shortName}) - Top Engineering College | Admissions 2026"'>With Acronym</option>
                    <option value='"{college.name} | {college.type} | {college.location} | WBJEE Cutoffs & Placements"'>SEO Focused</option>
                </Select>

                {/* Template Input */}
                <Stack space={2}>
                    <TextArea
                        rows={3}
                        value={template}
                        onChange={(e) => setTemplate(e.currentTarget.value)}
                        placeholder='"{college.name} - Best {college.type} College in {college.location}"'
                        fontSize={1}
                    />
                    {validation.errors.length > 0 && <Card padding={2} tone="critical"><Text size={0}>{validation.errors.join(', ')}</Text></Card>}
                    {validation.warnings.length > 0 && <Card padding={2} tone="caution"><Text size={0}>{validation.warnings.join(', ')}</Text></Card>}
                    {lengths && <Text size={0} muted>Length: {lengths.min}-{lengths.max} chars {lengths.avg >= 150 && lengths.avg <= 160 && '✓ Ideal'}</Text>}
                </Stack>

                {/* Filter & Count */}
                <Flex gap={2} align="center">
                    <Box flex={1}>
                        <Select value={filter} onChange={(e) => setFilter(e.currentTarget.value as 'all' | 'visible' | 'hidden')} fontSize={1}>
                            <option value="all">All ({totalCount})</option>
                            <option value="visible">Visible Only</option>
                            <option value="hidden">Hidden Only</option>
                        </Select>
                    </Box>
                    <Badge tone={filter === 'visible' ? 'positive' : filter === 'hidden' ? 'caution' : 'default'}>{totalCount}</Badge>
                </Flex>

                {/* Actions */}
                <Flex gap={2}>
                    <Button text="Preview" onClick={handlePreview} mode="ghost" tone="primary" icon={Eye} disabled={!validation.valid || updating} fontSize={1} />
                    <Button text={updating ? `${progress.current}/${progress.total}` : `Apply (${totalCount})`} onClick={handleApply} disabled={!validation.valid || updating || totalCount === 0} tone="positive" icon={updating ? undefined : Play} fontSize={1} style={{ flex: 1 }} />
                </Flex>

                {/* Progress */}
                {updating && <ProgressBar value={progress.current} max={progress.total} color="#ec4899" />}

                {/* Preview */}
                {preview.length > 0 && !showResults && (
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, maxHeight: '200px', overflowY: 'auto' }}>
                        <Stack space={2}>
                            <Text size={0} weight="semibold" muted>PREVIEW</Text>
                            {preview.map((p) => (
                                <Card key={p._id} padding={2} tone="transparent" radius={2}>
                                    <Stack space={1}>
                                        <Text size={1} weight="semibold">{p.name}</Text>
                                        <Text size={0} muted>Before: {p.old}</Text>
                                        <Text size={0} style={{ color: '#10b981' }}>After: {p.new} ({p.new.length})</Text>
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Results */}
                {showResults && results.length > 0 && (
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Flex justify="space-between" align="center">
                                <Text size={0} weight="semibold" muted>RESULTS</Text>
                                <Flex gap={2}>
                                    <Badge tone="positive"><CheckCircle2 size={12} /> {successCount}</Badge>
                                    {failCount > 0 && <Badge tone="critical"><XCircle size={12} /> {failCount}</Badge>}
                                </Flex>
                            </Flex>
                            {failCount > 0 && (
                                <Card padding={2} tone="critical" radius={2}>
                                    <Stack space={1}>
                                        {results.filter(r => !r.success).slice(0, 3).map(r => (
                                            <Text key={r.collegeId} size={0}>• {r.collegeName}: {r.error}</Text>
                                        ))}
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
