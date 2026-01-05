'use client'

import { Card, Stack, Text, Button, Box, TextInput, Checkbox, Badge, Spinner, Flex, Grid } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Eye, EyeOff, Search, CheckSquare, Square, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'

interface College {
    _id: string
    name: string
    isVisible: boolean
    location?: string
    type?: string
}

export function VisibilityWidget() {
    const client = useClient({ apiVersion })

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [colleges, setColleges] = useState<College[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
    const [search, setSearch] = useState('')

    // Fetch colleges
    const fetchColleges = useCallback(async () => {
        setLoading(true)
        try {
            const result = await client.fetch<College[]>(`
                *[_type == "college"] | order(name asc) {
                    _id,
                    name,
                    isVisible,
                    location,
                    type
                }
            `)
            setColleges(result || [])
        } catch (error) {
            console.error('Failed to fetch colleges:', error)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => {
        fetchColleges()
    }, [fetchColleges])

    // Filtered colleges
    const filteredColleges = colleges.filter(college => {
        if (filter === 'visible' && !college.isVisible) return false
        if (filter === 'hidden' && college.isVisible) return false
        if (search && !college.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    // Toggle selection
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    // Select all visible in current filter
    const selectAll = () => {
        setSelected(new Set(filteredColleges.map(c => c._id)))
    }

    // Clear selection
    const clearSelection = () => {
        setSelected(new Set())
    }

    // Bulk update visibility - NO CONFIRMATION
    const updateVisibility = async (visible: boolean) => {
        if (selected.size === 0) return

        setUpdating(true)
        try {
            const transaction = client.transaction()
            selected.forEach(id => {
                transaction.patch(id, { set: { isVisible: visible } })
            })
            await transaction.commit()

            // Update local state
            setColleges(prev => prev.map(c =>
                selected.has(c._id) ? { ...c, isVisible: visible } : c
            ))
            setSelected(new Set())
        } catch (error) {
            console.error('Failed to update visibility:', error)
            alert('Failed to update visibility. See console for details.')
        } finally {
            setUpdating(false)
        }
    }

    // Stats
    const visibleCount = colleges.filter(c => c.isVisible).length
    const hiddenCount = colleges.length - visibleCount

    if (loading) {
        return (
            <Card padding={4}>
                <Stack space={3} style={{ alignItems: 'center', padding: '2rem' }}>
                    <Spinner />
                    <Text size={1} muted>Loading colleges...</Text>
                </Stack>
            </Card>
        )
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Stack space={1}>
                        <Text size={2} weight="bold">Visibility Manager</Text>
                        <Text size={0} muted>Show or hide colleges on the website</Text>
                    </Stack>
                    <Button
                        mode="ghost"
                        icon={RefreshCw}
                        onClick={fetchColleges}
                        fontSize={1}
                        title="Refresh"
                    />
                </Flex>

                {/* Stats Row */}
                <Grid columns={3} gap={2}>
                    <Card padding={2} tone="positive" border radius={2}>
                        <Stack space={1} style={{ textAlign: 'center' }}>
                            <Eye size={16} style={{ margin: '0 auto' }} />
                            <Text size={2} weight="bold">{visibleCount}</Text>
                            <Text size={0}>Visible</Text>
                        </Stack>
                    </Card>
                    <Card padding={2} tone="caution" border radius={2}>
                        <Stack space={1} style={{ textAlign: 'center' }}>
                            <EyeOff size={16} style={{ margin: '0 auto' }} />
                            <Text size={2} weight="bold">{hiddenCount}</Text>
                            <Text size={0}>Hidden</Text>
                        </Stack>
                    </Card>
                    <Card padding={2} border radius={2}>
                        <Stack space={1} style={{ textAlign: 'center' }}>
                            <Text size={2} weight="bold">{colleges.length}</Text>
                            <Text size={0}>Total</Text>
                        </Stack>
                    </Card>
                </Grid>

                {/* Search */}
                <TextInput
                    icon={Search}
                    placeholder="Search colleges..."
                    value={search}
                    onChange={e => setSearch(e.currentTarget.value)}
                    fontSize={1}
                />

                {/* Filter Tabs */}
                <Grid columns={3} gap={2}>
                    <Button
                        mode={filter === 'all' ? 'default' : 'ghost'}
                        text={`All (${colleges.length})`}
                        onClick={() => setFilter('all')}
                        fontSize={1}
                        tone={filter === 'all' ? 'primary' : 'default'}
                    />
                    <Button
                        mode={filter === 'visible' ? 'default' : 'ghost'}
                        text={`Visible (${visibleCount})`}
                        onClick={() => setFilter('visible')}
                        fontSize={1}
                        tone={filter === 'visible' ? 'positive' : 'default'}
                    />
                    <Button
                        mode={filter === 'hidden' ? 'default' : 'ghost'}
                        text={`Hidden (${hiddenCount})`}
                        onClick={() => setFilter('hidden')}
                        fontSize={1}
                        tone={filter === 'hidden' ? 'caution' : 'default'}
                    />
                </Grid>

                {/* Selection Controls */}
                <Flex justify="space-between" align="center">
                    <Flex gap={2}>
                        <Button
                            mode="ghost"
                            icon={CheckSquare}
                            text="Select All"
                            onClick={selectAll}
                            fontSize={1}
                        />
                        {selected.size > 0 && (
                            <Button
                                mode="ghost"
                                icon={Square}
                                text="Clear"
                                onClick={clearSelection}
                                fontSize={1}
                            />
                        )}
                    </Flex>
                    {selected.size > 0 && (
                        <Badge tone="primary" fontSize={1}>{selected.size} selected</Badge>
                    )}
                </Flex>

                {/* College List */}
                <Card
                    padding={0}
                    border
                    radius={2}
                    style={{
                        maxHeight: '250px',
                        overflowY: 'auto'
                    }}
                >
                    {filteredColleges.length === 0 ? (
                        <Box padding={4} style={{ textAlign: 'center' }}>
                            <Text size={1} muted>No colleges match your filters</Text>
                        </Box>
                    ) : (
                        <Stack space={0}>
                            {filteredColleges.map((college, index) => (
                                <Box
                                    key={college._id}
                                    padding={3}
                                    style={{
                                        borderBottom: index < filteredColleges.length - 1 ? '1px solid var(--card-border-color)' : 'none',
                                        cursor: 'pointer',
                                        background: selected.has(college._id) ? 'rgba(66, 153, 225, 0.1)' : undefined,
                                        transition: 'background 0.15s'
                                    }}
                                    onClick={() => toggleSelect(college._id)}
                                >
                                    <Flex justify="space-between" align="center" gap={3}>
                                        <Flex align="center" gap={3}>
                                            <Checkbox
                                                checked={selected.has(college._id)}
                                                onChange={() => toggleSelect(college._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Stack space={1}>
                                                <Text size={1} weight="medium">{college.name}</Text>
                                                {college.location && (
                                                    <Text size={0} muted>{college.location}</Text>
                                                )}
                                            </Stack>
                                        </Flex>
                                        <Box
                                            style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: college.isVisible ? 'rgba(72, 187, 120, 0.2)' : 'rgba(237, 137, 54, 0.2)',
                                                color: college.isVisible ? '#276749' : '#9c4221',
                                                fontSize: '11px',
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            {college.isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                                            {college.isVisible ? 'Visible' : 'Hidden'}
                                        </Box>
                                    </Flex>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Action Buttons - ALWAYS VISIBLE, disabled when nothing selected */}
                <Grid columns={2} gap={2}>
                    <Button
                        mode="default"
                        icon={Eye}
                        text={updating ? 'Updating...' : `Show${selected.size > 0 ? ` (${selected.size})` : ''}`}
                        onClick={() => updateVisibility(true)}
                        disabled={selected.size === 0 || updating}
                        tone="positive"
                    />
                    <Button
                        mode="default"
                        icon={EyeOff}
                        text={updating ? 'Updating...' : `Hide${selected.size > 0 ? ` (${selected.size})` : ''}`}
                        onClick={() => updateVisibility(false)}
                        disabled={selected.size === 0 || updating}
                        tone="caution"
                    />
                </Grid>
            </Stack>
        </Card>
    )
}
