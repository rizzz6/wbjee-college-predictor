// Visibility Manager Widget
// Show or hide colleges on the website

'use client'

import { Stack, Text, Button, Box, TextInput, Checkbox, Badge, Flex, Grid, Card } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Eye, EyeOff, Search, CheckSquare, Square, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, StatsGrid, EmptyState } from './shared'

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

    const fetchColleges = useCallback(async () => {
        setLoading(true)
        try {
            const result = await client.fetch<College[]>(`
                *[_type == "college"] | order(name asc) { _id, name, isVisible, location, type }
            `)
            setColleges(result || [])
        } catch (error) {
            console.error('Failed to fetch colleges:', error)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => { fetchColleges() }, [fetchColleges])

    const filteredColleges = colleges.filter(college => {
        if (filter === 'visible' && !college.isVisible) return false
        if (filter === 'hidden' && college.isVisible) return false
        if (search && !college.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => setSelected(new Set(filteredColleges.map(c => c._id)))
    const clearSelection = () => setSelected(new Set())

    const updateVisibility = async (visible: boolean) => {
        if (selected.size === 0) return
        setUpdating(true)
        try {
            const transaction = client.transaction()
            selected.forEach(id => transaction.patch(id, { set: { isVisible: visible } }))
            await transaction.commit()
            setColleges(prev => prev.map(c => selected.has(c._id) ? { ...c, isVisible: visible } : c))
            setSelected(new Set())
        } catch (error) {
            console.error('Failed to update:', error)
            alert('Failed to update visibility')
        } finally {
            setUpdating(false)
        }
    }

    const visibleCount = colleges.filter(c => c.isVisible).length
    const hiddenCount = colleges.length - visibleCount

    return (
        <WidgetCard
            title="Visibility Manager"
            icon={<Eye size={18} />}
            iconColor="#10b981"
            headerGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            loading={loading}
            collapsible
            actions={
                <Button icon={RefreshCw} onClick={fetchColleges} mode="bleed" style={{ color: 'white' }} />
            }
        >
            <Stack space={4}>
                {/* Stats */}
                <StatsGrid
                    columns={3}
                    stats={[
                        { label: 'Visible', value: visibleCount, tone: 'positive', icon: <Eye size={14} /> },
                        { label: 'Hidden', value: hiddenCount, tone: 'caution', icon: <EyeOff size={14} /> },
                        { label: 'Total', value: colleges.length }
                    ]}
                />

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
                    <Button mode={filter === 'all' ? 'default' : 'ghost'} text={`All (${colleges.length})`} onClick={() => setFilter('all')} fontSize={1} tone={filter === 'all' ? 'primary' : 'default'} />
                    <Button mode={filter === 'visible' ? 'default' : 'ghost'} text={`Visible (${visibleCount})`} onClick={() => setFilter('visible')} fontSize={1} tone={filter === 'visible' ? 'positive' : 'default'} />
                    <Button mode={filter === 'hidden' ? 'default' : 'ghost'} text={`Hidden (${hiddenCount})`} onClick={() => setFilter('hidden')} fontSize={1} tone={filter === 'hidden' ? 'caution' : 'default'} />
                </Grid>

                {/* Selection Controls */}
                <Flex justify="space-between" align="center">
                    <Flex gap={2}>
                        <Button mode="ghost" icon={CheckSquare} text="Select All" onClick={selectAll} fontSize={0} />
                        {selected.size > 0 && <Button mode="ghost" icon={Square} text="Clear" onClick={clearSelection} fontSize={0} />}
                    </Flex>
                    {selected.size > 0 && <Badge tone="primary">{selected.size} selected</Badge>}
                </Flex>

                {/* College List */}
                <Box padding={2} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, maxHeight: '220px', overflowY: 'auto' }}>
                    {filteredColleges.length === 0 ? (
                        <EmptyState title="No colleges found" description="Try a different filter" />
                    ) : (
                        <Stack space={2}>
                            {filteredColleges.map(college => (
                                <Card
                                    key={college._id}
                                    padding={2}
                                    radius={2}
                                    tone="transparent"
                                    border
                                    style={{
                                        background: selected.has(college._id) ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Flex
                                        align="center"
                                        gap={2}
                                        onClick={() => toggleSelect(college._id)}
                                    >
                                        <Box onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selected.has(college._id)}
                                                onChange={() => toggleSelect(college._id)}
                                            />
                                        </Box>
                                        <Stack space={0} flex={1} style={{ minWidth: 0 }}>
                                            <Text size={1} style={{ wordBreak: 'break-word', lineHeight: 1.2 }}>{college.name}</Text>
                                            {college.location && <Text size={0} muted style={{ wordBreak: 'break-word', marginTop: '6px' }}>{college.location}</Text>}
                                        </Stack>
                                        <Badge tone={college.isVisible ? 'positive' : 'caution'} fontSize={0}>
                                            {college.isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                                            {college.isVisible ? 'Visible' : 'Hidden'}
                                        </Badge>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>

                {/* Action Buttons */}
                <Grid columns={2} gap={2}>
                    <Button
                        mode="default"
                        icon={Eye}
                        text={updating ? 'Updating...' : `Show (${selected.size})`}
                        onClick={() => updateVisibility(true)}
                        disabled={selected.size === 0 || updating}
                        tone="positive"
                    />
                    <Button
                        mode="default"
                        icon={EyeOff}
                        text={updating ? 'Updating...' : `Hide (${selected.size})`}
                        onClick={() => updateVisibility(false)}
                        disabled={selected.size === 0 || updating}
                        tone="caution"
                    />
                </Grid>
            </Stack>
        </WidgetCard>
    )
}
