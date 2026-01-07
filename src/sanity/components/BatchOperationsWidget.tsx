// Batch Operations Widget
// Perform bulk operations on selected colleges

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Select, Checkbox, TextInput, Card } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Layers, CheckSquare, Square, Trash2, Eye, EyeOff, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, EmptyState } from './shared'

interface College {
    _id: string
    name: string
    location: string
    type: string
    isVisible: boolean
}

type Operation = 'show' | 'hide' | 'setType' | 'setLocation' | 'delete'

export function BatchOperationsWidget() {
    const client = useClient({ apiVersion })
    const [colleges, setColleges] = useState<College[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [operating, setOperating] = useState(false)
    const [operation, setOperation] = useState<Operation>('show')
    const [operationValue, setOperationValue] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'visible' | 'hidden'>('all')

    const fetchColleges = useCallback(async () => {
        setLoading(true)
        try {
            const data = await client.fetch<College[]>(`*[_type == "college"] | order(name asc) { _id, name, location, type, isVisible }`)
            setColleges(data)
        } catch (error) {
            console.error('Failed to fetch colleges:', error)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => { fetchColleges() }, [fetchColleges])

    const filteredColleges = colleges.filter(college => {
        const matchesSearch = !searchTerm || college.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'all' ||
            (filterType === 'visible' && college.isVisible) ||
            (filterType === 'hidden' && !college.isVisible)
        return matchesSearch && matchesFilter
    })

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selected)
        if (newSelected.has(id)) newSelected.delete(id)
        else newSelected.add(id)
        setSelected(newSelected)
    }

    const selectAll = () => {
        if (selected.size === filteredColleges.length) setSelected(new Set())
        else setSelected(new Set(filteredColleges.map(c => c._id)))
    }

    const executeOperation = async () => {
        if (selected.size === 0) return alert('Select at least one college')

        const operationLabels: Record<Operation, string> = {
            show: 'make visible', hide: 'hide', setType: `set type to "${operationValue}"`,
            setLocation: `update location to "${operationValue}"`, delete: 'permanently DELETE'
        }

        if (!window.confirm(`${operation === 'delete' ? '⚠️ ' : ''}${operationLabels[operation]} ${selected.size} college(s)?`)) return

        setOperating(true)
        let success = 0

        try {
            const selectedIds = Array.from(selected)
            if (operation === 'delete') {
                const transaction = client.transaction()
                selectedIds.forEach(id => transaction.delete(id))
                await transaction.commit()
                success = selectedIds.length
            } else {
                for (const id of selectedIds) {
                    try {
                        let patch = client.patch(id)
                        if (operation === 'show') patch = patch.set({ isVisible: true })
                        else if (operation === 'hide') patch = patch.set({ isVisible: false })
                        else if (operation === 'setType' && operationValue) patch = patch.set({ type: operationValue })
                        else if (operation === 'setLocation' && operationValue) patch = patch.set({ location: operationValue })
                        await patch.commit()
                        success++
                    } catch (err) {
                        console.error(`Failed to update ${id}:`, err)
                    }
                }
            }

            alert(`✓ Updated ${success} colleges`)
            await fetchColleges()
            setSelected(new Set())
            setOperationValue('')
        } catch (error) {
            console.error('Operation failed:', error)
            alert('Operation failed')
        } finally {
            setOperating(false)
        }
    }

    const getOperationRequiresValue = () => operation === 'setType' || operation === 'setLocation'

    return (
        <WidgetCard
            title="Batch Operations"
            icon={<Layers size={18} />}
            iconColor="#7c3aed"
            headerGradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
            loading={loading}
            collapsible
            actions={
                <Button icon={RefreshCw} onClick={fetchColleges} disabled={loading} mode="bleed" style={{ color: 'white' }} />
            }
        >
            <Stack space={4}>
                {/* Stats */}
                <Flex gap={2} wrap="wrap">
                    <Badge tone={selected.size > 0 ? 'primary' : 'default'}>{selected.size} selected</Badge>
                    <Badge tone="default">{colleges.length} total</Badge>
                    <Badge tone="positive">{colleges.filter(c => c.isVisible).length} visible</Badge>
                    <Badge tone="caution">{colleges.filter(c => !c.isVisible).length} hidden</Badge>
                </Flex>

                {/* Search & Filter */}
                <Flex gap={2}>
                    <Box flex={1}>
                        <TextInput placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.currentTarget.value)} fontSize={1} />
                    </Box>
                    <Select value={filterType} onChange={(e) => setFilterType(e.currentTarget.value as 'all' | 'visible' | 'hidden')} fontSize={1}>
                        <option value="all">All</option>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                    </Select>
                </Flex>

                {/* Quick Select */}
                <Flex gap={2}>
                    <Button text={selected.size === filteredColleges.length ? 'Deselect' : 'Select All'} icon={selected.size === filteredColleges.length ? Square : CheckSquare} onClick={selectAll} mode="ghost" fontSize={0} />
                    <Button text="Visible" icon={Eye} onClick={() => setSelected(new Set(colleges.filter(c => c.isVisible).map(c => c._id)))} mode="ghost" fontSize={0} />
                    <Button text="Hidden" icon={EyeOff} onClick={() => setSelected(new Set(colleges.filter(c => !c.isVisible).map(c => c._id)))} mode="ghost" fontSize={0} />
                </Flex>

                {/* College List */}
                <Box padding={2} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredColleges.length > 0 ? (
                        <Stack space={2}>
                            {filteredColleges.map(college => (
                                <Card
                                    key={college._id}
                                    padding={2}
                                    radius={2}
                                    tone="transparent"
                                    border
                                    style={{
                                        background: selected.has(college._id) ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
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
                                            <Text size={0} muted style={{ wordBreak: 'break-word', marginTop: '6px' }}>{college.location || 'No location'} • {college.type || 'No type'}</Text>
                                        </Stack>
                                        <Badge tone={college.isVisible ? 'positive' : 'caution'} fontSize={0}>
                                            {college.isVisible ? 'Visible' : 'Hidden'}
                                        </Badge>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState title="No results" description="Try a different search" />
                    )}
                </Box>

                {/* Operation Selection */}
                <Box padding={3} style={{ background: operation === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(124, 58, 237, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>SELECT OPERATION</Text>
                        <Select
                            value={operation}
                            onChange={(e) => { setOperation(e.currentTarget.value as Operation); setOperationValue('') }}
                            fontSize={1}
                        >
                            <option value="show">Make Visible</option>
                            <option value="hide">Hide</option>
                            <option value="setType">Set Type</option>
                            <option value="setLocation">Update Location</option>
                            <option value="delete">⚠️ Delete (Permanent)</option>
                        </Select>

                        {getOperationRequiresValue() && (
                            <TextInput
                                placeholder={operation === 'setType' ? 'e.g., Government, Private' : 'e.g., Kolkata'}
                                value={operationValue}
                                onChange={(e) => setOperationValue(e.currentTarget.value)}
                                fontSize={1}
                            />
                        )}

                        <Button
                            text={operating ? 'Processing...' : `Apply to ${selected.size}`}
                            icon={operation === 'delete' ? Trash2 : Check}
                            onClick={executeOperation}
                            disabled={operating || selected.size === 0 || (getOperationRequiresValue() && !operationValue)}
                            tone={operation === 'delete' ? 'critical' : 'positive'}
                            fontSize={1}
                        />

                        {operation === 'delete' && (
                            <Flex align="center" gap={2}>
                                <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                                <Text size={0} style={{ color: '#ef4444' }}>Cannot be undone!</Text>
                            </Flex>
                        )}
                    </Stack>
                </Box>
            </Stack>
        </WidgetCard>
    )
}
