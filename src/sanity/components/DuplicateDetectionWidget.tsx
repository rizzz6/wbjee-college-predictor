// Duplicate Detection Widget
// Finds and helps merge duplicate college entries

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Card } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { Copy, GitMerge, Search, AlertCircle } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard } from './shared'
import { findDuplicates, groupDuplicates, mergeDuplicates, DuplicateMatch, DuplicateGroup } from '../utils/duplicateDetection'

interface College {
    _id: string
    name: string
    location?: string
    type?: string
}

export function DuplicateDetectionWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [matches, setMatches] = useState<DuplicateMatch[]>([])
    const [groups, setGroups] = useState<DuplicateGroup[]>([])
    const [merging, setMerging] = useState<Set<string>>(new Set())
    const [ignored, setIgnored] = useState<Set<string>>(new Set())

    const handleScan = async () => {
        setScanning(true)
        try {
            const duplicates = await findDuplicates(client, 70)
            setMatches(duplicates)
            setGroups(duplicates.length > 0 ? groupDuplicates(duplicates) : [])
        } catch (error) {
            console.error('Duplicate scan failed:', error)
        } finally {
            setScanning(false)
        }
    }

    const handleMerge = async (group: DuplicateGroup) => {
        const primaryId = group.suggestedPrimary
        const duplicateIds = group.colleges.filter((c: College) => c._id !== primaryId).map((c: College) => c._id)
        const primaryName = group.colleges.find((c: College) => c._id === primaryId)?.name

        if (!window.confirm(`Merge ${duplicateIds.length} duplicate(s) into "${primaryName}"?\n\nThis cannot be undone!`)) return

        setMerging(prev => new Set(prev).add(primaryId))
        try {
            const result = await mergeDuplicates(client, primaryId, duplicateIds)
            if (result.success) await handleScan()
            else alert(`Merge failed: ${result.message}`)
        } catch {
            alert('Merge failed')
        } finally {
            setMerging(prev => { const next = new Set(prev); next.delete(primaryId); return next })
        }
    }

    const navigateToCollege = (id: string) => router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type: 'college' })

    const handleDismiss = (groupId: string) => {
        setIgnored(prev => new Set(prev).add(groupId))
    }

    const visibleGroups = groups.filter(g => !ignored.has(g.suggestedPrimary))

    return (
        <WidgetCard
            title="Duplicate Detection"
            icon={<Copy size={18} />}
            iconColor="#f59e0b"
            headerGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            loading={scanning}
            collapsible
            actions={
                <Button
                    icon={Search}
                    onClick={handleScan}
                    disabled={scanning}
                    mode="bleed"
                    style={{ color: 'white' }}
                    title="Scan for Duplicates"
                />
            }
        >
            <Stack space={4}>
                {/* Results Summary */}
                {groups.length > 0 && (
                    <Box padding={3} style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                        <Flex justify="space-between" align="center">
                            <Flex gap={2} align="center">
                                <AlertCircle size={16} />
                                <Text size={1} weight="semibold">{visibleGroups.length} duplicate groups</Text>
                                {ignored.size > 0 && <Text size={0} muted>({ignored.size} dismissed)</Text>}
                            </Flex>
                            <Badge tone="caution">{matches.length} matches</Badge>
                        </Flex>
                    </Box>
                )}

                {/* No Duplicates */}
                {!scanning && matches.length === 0 && groups.length === 0 && (
                    <Box padding={4} style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                        <Stack space={2}>
                            <Copy size={28} style={{ margin: '0 auto', color: '#10b981' }} />
                            <Text size={1} weight="semibold" style={{ color: '#10b981' }}>No duplicates found!</Text>
                            <Text size={0} muted>All entries appear unique</Text>
                        </Stack>
                    </Box>
                )}

                {/* Duplicate Groups */}
                {groups.length > 0 && (
                    <Box style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <Stack space={3}>
                            {visibleGroups.map((group, groupIdx) => {
                                const primary = group.colleges.find((c: College) => c._id === group.suggestedPrimary)
                                const duplicates = group.colleges.filter((c: College) => c._id !== group.suggestedPrimary)
                                const isMerging = merging.has(group.suggestedPrimary)

                                return (
                                    <Card key={groupIdx} padding={3} border tone="caution" radius={2}>
                                        <Stack space={3}>
                                            <Flex justify="space-between" align="center">
                                                <Stack space={1}>
                                                    <Text size={1} weight="semibold">Group #{groupIdx + 1}</Text>
                                                    <Badge tone="caution">{group.similarity}% similar</Badge>
                                                </Stack>
                                                <Flex gap={1}>
                                                    <Button
                                                        text="Dismiss"
                                                        onClick={() => handleDismiss(group.suggestedPrimary)}
                                                        mode="ghost"
                                                        tone="default"
                                                        fontSize={0}
                                                    />
                                                    <Button
                                                        text={isMerging ? 'Merging...' : `Merge ${duplicates.length}`}
                                                        onClick={() => handleMerge(group)}
                                                        disabled={isMerging}
                                                        icon={GitMerge}
                                                        tone="caution"
                                                        fontSize={0}
                                                    />
                                                </Flex>
                                            </Flex>

                                            {/* Primary */}
                                            {primary && (
                                                <Card padding={3} tone="positive" radius={2}>
                                                    <Flex justify="space-between" align="flex-start" gap={2}>
                                                        <Stack space={1} flex={1} style={{ minWidth: 0 }}>
                                                            <Text size={0} weight="semibold" style={{ color: '#10b981' }}>✓ Keep</Text>
                                                            <Text size={1} style={{ wordBreak: 'break-word' }}>{primary.name}</Text>
                                                            <Text size={0} muted style={{ wordBreak: 'break-word' }}>{primary.location} • {primary.type}</Text>
                                                        </Stack>
                                                        <Button text="View" onClick={() => navigateToCollege(primary._id)} mode="ghost" fontSize={0} style={{ flexShrink: 0 }} />
                                                    </Flex>
                                                </Card>
                                            )}

                                            {/* Duplicates */}
                                            <Stack space={1}>
                                                {duplicates.map((dup: College) => (
                                                    <Card key={dup._id} padding={3} tone="transparent" border radius={2}>
                                                        <Flex justify="space-between" align="flex-start" gap={2}>
                                                            <Stack space={1} flex={1} style={{ minWidth: 0 }}>
                                                                <Text size={0} muted>✗ Delete</Text>
                                                                <Text size={1} style={{ wordBreak: 'break-word' }}>{dup.name}</Text>
                                                                <Text size={0} muted style={{ wordBreak: 'break-word' }}>{dup.location}</Text>
                                                            </Stack>
                                                            <Button text="View" onClick={() => navigateToCollege(dup._id)} mode="ghost" fontSize={0} style={{ flexShrink: 0 }} />
                                                        </Flex>
                                                    </Card>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </Card>
                                )
                            })}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
