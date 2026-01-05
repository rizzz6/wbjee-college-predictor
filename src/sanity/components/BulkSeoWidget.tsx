'use client'

import { Card, Stack, Text, TextArea, Button, Box, Select, Badge, Spinner, useToast } from '@sanity/ui'
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
    type BulkUpdateProgress
} from '../utils/bulkUpdate'
import { apiVersion } from '../env'

export function BulkSeoWidget() {
    const client = useClient({ apiVersion })
    const toast = useToast()

    const [template, setTemplate] = useState('')
    const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
    const [preview, setPreview] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [updating, setUpdating] = useState(false)
    const [progress, setProgress] = useState<BulkUpdateProgress>({ current: 0, total: 0 })
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<any[]>([])

    // Fetch total count when filter changes
    useEffect(() => {
        getCollegeCount(client, filter).then(setTotalCount)
    }, [filter, client])

    // Validate template
    const validation = template ? validateTemplate(template) : { valid: false, errors: [], warnings: [] }
    const lengths = template ? getProcessedLength(template) : null

    // Generate preview
    const handlePreview = async () => {
        if (!validation.valid) {
            toast.push({
                status: 'error',
                title: 'Invalid Template',
                description: validation.errors.join(', ')
            })
            return
        }

        try {
            const colleges = await fetchCollegesForPreview(client, filter, 10)

            const previewed = colleges.map(c => ({
                _id: c._id,
                name: c.name,
                old: c.description || '(empty)',
                new: processTemplate(template, c),
                isVisible: c.isVisible
            }))

            setPreview(previewed)
            setShowResults(false)
        } catch (error) {
            toast.push({
                status: 'error',
                title: 'Preview Failed',
                description: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    // Apply updates
    const handleApply = async () => {
        if (!validation.valid) {
            toast.push({
                status: 'error',
                title: 'Invalid Template',
                description: validation.errors.join(', ')
            })
            return
        }

        const confirmed = window.confirm(
            `Apply SEO descriptions to ${totalCount} ${filter === 'all' ? '' : filter} colleges?\n\nThis action cannot be undone in bulk.`
        )
        if (!confirmed) return

        setUpdating(true)
        setProgress({ current: 0, total: totalCount })
        setShowResults(false)

        try {
            // Fetch all IDs matching filter
            const baseQuery = '_type == "college"'
            const filterQuery = filter === 'all'
                ? baseQuery
                : `${baseQuery} && isVisible == ${filter === 'visible'}`

            const ids = await client.fetch(`*[${filterQuery}]._id`)

            // Perform bulk update
            const updateResults = await bulkUpdateSeoDescriptions(
                client,
                ids,
                template,
                (prog) => setProgress(prog)
            )

            setResults(updateResults)
            setShowResults(true)

            const successCount = updateResults.filter(r => r.success).length
            const failCount = updateResults.length - successCount

            toast.push({
                status: failCount === 0 ? 'success' : 'warning',
                title: 'Bulk Update Complete',
                description: `✅ ${successCount} updated • ${failCount > 0 ? `❌ ${failCount} failed` : ''}`
            })

        } catch (error) {
            toast.push({
                status: 'error',
                title: 'Bulk Update Failed',
                description: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setUpdating(false)
        }
    }

    // Insert variable at cursor
    const insertVariable = (variable: string) => {
        setTemplate(prev => prev + variable)
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} />
                    <Text size={2} weight="bold">Bulk SEO Description Update</Text>
                </Box>

                {/* Variable Reference */}
                <Card padding={3} tone="transparent" border>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">Available Variables:</Text>
                        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {AVAILABLE_VARIABLES.map(v => (
                                <Badge
                                    key={v.key}
                                    tone="primary"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => insertVariable(v.key)}
                                    title={`${v.description} (e.g., ${v.example})`}
                                >
                                    {v.key}
                                </Badge>
                            ))}
                        </Box>
                        <Text size={0} muted>Click a variable to insert into template</Text>
                    </Stack>
                </Card>

                {/* Template Presets */}
                <Stack space={2}>
                    <Text size={1} weight="semibold">Quick Templates:</Text>
                    <Select
                        value=""
                        onChange={(e) => {
                            const value = e.currentTarget.value
                            if (value) setTemplate(value)
                        }}
                        fontSize={1}
                    >
                        <option value="">Select a template...</option>
                        <option value='"{college.name} - Best {college.type} College in {college.location} | WBJEE 2026"'>
                            Standard Template
                        </option>
                        <option value='"{college.name} ({college.shortName}) - Top Engineering College in {college.location} | Admissions 2026"'>
                            With Acronym
                        </option>
                        <option value='"Explore {college.name}, a premier {college.type} college in {college.location}. Est. {college.estYear}."'>
                            Descriptive
                        </option>
                        <option value='"{college.name} | {college.type} Engineering College | {college.location} | WBJEE Cutoffs & Placements"'>
                            SEO Focused
                        </option>
                    </Select>
                </Stack>

                {/* Template Input */}
                <Stack space={2}>
                    <Text size={1} weight="semibold">Template:</Text>
                    <TextArea
                        rows={3}
                        value={template}
                        onChange={(e) => setTemplate(e.currentTarget.value)}
                        placeholder='Example: "{college.name} - Best {college.type} College in {college.location} | WBJEE 2026"'
                        fontSize={1}
                    />

                    {/* Validation Messages */}
                    {validation.errors.length > 0 && (
                        <Card padding={2} tone="critical">
                            <Text size={0}>{validation.errors.join(', ')}</Text>
                        </Card>
                    )}
                    {validation.warnings.length > 0 && (
                        <Card padding={2} tone="caution">
                            <Text size={0}>{validation.warnings.join(', ')}</Text>
                        </Card>
                    )}

                    {/* Length Indicator */}
                    {lengths && (
                        <Text size={0} muted>
                            Estimated length: {lengths.min}-{lengths.max} chars (avg: {lengths.avg})
                            {lengths.avg >= 150 && lengths.avg <= 160 && ' ✓ Ideal for SEO'}
                        </Text>
                    )}
                </Stack>

                {/* Filter & Count */}
                <Stack space={2}>
                    <Text size={1} weight="semibold">Target Colleges:</Text>
                    <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.currentTarget.value as any)}
                            fontSize={1}
                            style={{ flex: 1 }}
                        >
                            <option value="all">All Colleges ({totalCount})</option>
                            <option value="visible">Visible Only</option>
                            <option value="hidden">Hidden Only</option>
                        </Select>
                        <Badge tone={filter === 'all' ? 'default' : filter === 'visible' ? 'positive' : 'caution'}>
                            {totalCount} colleges
                        </Badge>
                    </Box>
                </Stack>

                {/* Actions */}
                <Box style={{ display: 'flex', gap: 8 }}>
                    <Button
                        text="Preview (10)"
                        onClick={handlePreview}
                        mode="ghost"
                        tone="primary"
                        icon={Eye}
                        disabled={!validation.valid || updating}
                        fontSize={1}
                    />
                    <Button
                        text={updating ? `Updating ${progress.current}/${progress.total}...` : `Apply to ${totalCount} Colleges`}
                        onClick={handleApply}
                        disabled={!validation.valid || updating || totalCount === 0}
                        tone="positive"
                        icon={updating ? undefined : Play}
                        fontSize={1}
                    />
                </Box>

                {/* Progress */}
                {updating && (
                    <Card padding={3} tone="transparent">
                        <Stack space={2}>
                            <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text size={1}>Progress: {progress.current} / {progress.total}</Text>
                                <Text size={0} muted>{Math.round((progress.current / progress.total) * 100)}%</Text>
                            </Box>
                            {progress.currentCollege && (
                                <Text size={0} muted>Current: {progress.currentCollege}</Text>
                            )}
                            <div style={{
                                width: '100%',
                                height: '4px',
                                background: '#e0e0e0',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                    height: '100%',
                                    background: '#43c463',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </Stack>
                    </Card>
                )}

                {/* Preview Table */}
                {preview.length > 0 && !showResults && (
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">Preview (first 10 colleges):</Text>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {preview.map((p) => (
                                    <Card key={p._id} padding={2} style={{ marginBottom: 8 }} tone="transparent">
                                        <Stack space={1}>
                                            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <Text size={1} weight="bold">{p.name}</Text>
                                                {p.isVisible && <Badge tone="positive" fontSize={0}>Visible</Badge>}
                                            </Box>
                                            <Text size={0} style={{ color: '#999' }}>
                                                Before: {p.old}
                                            </Text>
                                            <Text size={0} style={{ color: '#43c463' }}>
                                                After: {p.new} ({p.new.length} chars)
                                            </Text>
                                        </Stack>
                                    </Card>
                                ))}
                            </div>
                        </Stack>
                    </Card>
                )}

                {/* Results */}
                {showResults && results.length > 0 && (
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size={1} weight="semibold">Update Results:</Text>
                                <Box style={{ display: 'flex', gap: 8 }}>
                                    <Badge tone="positive">
                                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        {results.filter(r => r.success).length} Success
                                    </Badge>
                                    {results.filter(r => !r.success).length > 0 && (
                                        <Badge tone="critical">
                                            <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                                            {results.filter(r => !r.success).length} Failed
                                        </Badge>
                                    )}
                                </Box>
                            </Box>

                            {/* Show failures */}
                            {results.filter(r => !r.success).length > 0 && (
                                <Card padding={2} tone="critical">
                                    <Stack space={1}>
                                        <Text size={0} weight="semibold">Failed Updates:</Text>
                                        {results.filter(r => !r.success).slice(0, 5).map(r => (
                                            <Text key={r.collegeId} size={0}>
                                                • {r.collegeName}: {r.error}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Card>
    )
}
