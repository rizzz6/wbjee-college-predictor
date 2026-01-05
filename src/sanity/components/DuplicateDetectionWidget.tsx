// Duplicate Detection Widget
// Finds and helps merge duplicate college entries

'use client'

import { Card, Stack, Text, Button, Box, Badge, Spinner, Flex, Grid } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { Copy, GitMerge, Search, AlertCircle } from 'lucide-react'
import { apiVersion } from '../env'
import { findDuplicates, groupDuplicates, mergeDuplicates, type DuplicateMatch, type DuplicateGroup } from '../utils/duplicateDetection'

export function DuplicateDetectionWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [matches, setMatches] = useState<DuplicateMatch[]>([])
    const [groups, setGroups] = useState<DuplicateGroup[]>([])
    const [merging, setMerging] = useState<Set<string>>(new Set())

    const handleScan = async () => {
        setScanning(true)
        try {
            const duplicates = await findDuplicates(client, 70)
            setMatches(duplicates)

            if (duplicates.length > 0) {
                const grouped = groupDuplicates(duplicates)
                setGroups(grouped)
            } else {
                setGroups([])
            }
        } catch (error) {
            console.error('Duplicate scan failed:', error)
        } finally {
            setScanning(false)
        }
    }

    const handleMerge = async (group: DuplicateGroup) => {
        const primaryId = group.suggestedPrimary
        const duplicateIds = group.colleges
            .filter(c => c._id !== primaryId)
            .map(c => c._id)

        const confirmed = window.confirm(
            `Merge ${duplicateIds.length} duplicate(s) into "${group.colleges.find(c => c._id === primaryId)?.name}"?\n\n` +
            `This will:\n` +
            `- Keep the primary college\n` +
            `- Merge missing data from duplicates\n` +
            `- Delete the duplicate entries\n\n` +
            `This action cannot be undone!`
        )

        if (!confirmed) return

        setMerging(prev => new Set(prev).add(primaryId))

        try {
            const result = await mergeDuplicates(client, primaryId, duplicateIds)

            if (result.success) {
                // Re-scan to update results
                await handleScan()
            } else {
                alert(`Merge failed: ${result.message}`)
            }
        } catch (error) {
            console.error('Merge failed:', error)
            alert('Merge failed. See console for details.')
        } finally {
            setMerging(prev => {
                const next = new Set(prev)
                next.delete(primaryId)
                return next
            })
        }
    }

    const navigateToCollege = (id: string) => {
        router.navigateUrl({ path: `/desk/college;${id}` })
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Stack space={1}>
                        <Text size={2} weight="bold">Duplicate Detection</Text>
                        <Text size={0} muted>Find and merge duplicate college entries</Text>
                    </Stack>
                    <Button
                        text={scanning ? 'Scanning...' : 'Scan for Duplicates'}
                        onClick={handleScan}
                        disabled={scanning}
                        icon={scanning ? undefined : Search}
                        tone="primary"
                        fontSize={1}
                    />
                </Flex>

                {/* Loading State */}
                {scanning && (
                    <Card padding={3} tone="transparent">
                        <Stack space={2} style={{ alignItems: 'center' }}>
                            <Spinner />
                            <Text size={1} muted>Analyzing colleges for duplicates...</Text>
                        </Stack>
                    </Card>
                )}

                {/* Results Summary */}
                {!scanning && groups.length > 0 && (
                    <Card padding={3} tone="caution" border>
                        <Flex justify="space-between" align="center">
                            <Flex gap={2} align="center">
                                <AlertCircle size={20} />
                                <Text size={1} weight="semibold">
                                    Found {groups.length} potential duplicate group{groups.length !== 1 ? 's' : ''}
                                </Text>
                            </Flex>
                            <Badge tone="caution">
                                {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </Badge>
                        </Flex>
                    </Card>
                )}

                {/* No Duplicates */}
                {!scanning && matches.length === 0 && groups.length === 0 && (
                    <Card padding={4} tone="positive" style={{ textAlign: 'center' }}>
                        <Stack space={2}>
                            <Copy size={32} style={{ margin: '0 auto', color: '#37b24d' }} />
                            <Text size={1} weight="semibold">No duplicates found!</Text>
                            <Text size={0} muted>All college entries appear unique</Text>
                        </Stack>
                    </Card>
                )}

                {/* Duplicate Groups */}
                {!scanning && groups.length > 0 && (
                    <Stack space={3} style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {groups.map((group, groupIdx) => {
                            const primary = group.colleges.find(c => c._id === group.suggestedPrimary)
                            const duplicates = group.colleges.filter(c => c._id !== group.suggestedPrimary)
                            const isMerging = merging.has(group.suggestedPrimary)

                            return (
                                <Card key={groupIdx} padding={3} border tone="caution">
                                    <Stack space={3}>
                                        {/* Group Header */}
                                        <Flex justify="space-between" align="center">
                                            <Stack space={1}>
                                                <Text size={1} weight="semibold">
                                                    Duplicate Group #{groupIdx + 1}
                                                </Text>
                                                <Badge tone="caution">
                                                    {group.similarity}% similarity
                                                </Badge>
                                            </Stack>
                                            <Button
                                                text={isMerging ? 'Merging...' : `Merge ${duplicates.length} Duplicate${duplicates.length !== 1 ? 's' : ''}`}
                                                onClick={() => handleMerge(group)}
                                                disabled={isMerging}
                                                icon={GitMerge}
                                                tone="caution"
                                                fontSize={0}
                                            />
                                        </Flex>

                                        {/* Primary College */}
                                        {primary && (
                                            <Card padding={2} tone="positive">
                                                <Stack space={1}>
                                                    <Flex justify="space-between" align="center">
                                                        <Text size={0} weight="semibold">
                                                            ✓ Primary (Keep This)
                                                        </Text>
                                                        <Button
                                                            text="View"
                                                            onClick={() => navigateToCollege(primary._id)}
                                                            mode="ghost"
                                                            fontSize={0}
                                                        />
                                                    </Flex>
                                                    <Text size={1} weight="medium">{primary.name}</Text>
                                                    <Grid columns={2} gap={1}>
                                                        <Text size={0} muted>📍 {primary.location}</Text>
                                                        <Text size={0} muted>🏛️ {primary.type}</Text>
                                                    </Grid>
                                                    {primary.isVisible && (
                                                        <Badge tone="positive" fontSize={0}>Visible</Badge>
                                                    )}
                                                </Stack>
                                            </Card>
                                        )}

                                        {/* Duplicate Colleges */}
                                        <Stack space={2}>
                                            <Text size={0} weight="semibold" muted>
                                                Duplicates (Will be deleted):
                                            </Text>
                                            {duplicates.map(dup => (
                                                <Card key={dup._id} padding={2} tone="transparent" border>
                                                    <Stack space={1}>
                                                        <Flex justify="space-between" align="center">
                                                            <Text size={0} muted>✗ Duplicate</Text>
                                                            <Button
                                                                text="View"
                                                                onClick={() => navigateToCollege(dup._id)}
                                                                mode="ghost"
                                                                fontSize={0}
                                                            />
                                                        </Flex>
                                                        <Text size={1}>{dup.name}</Text>
                                                        <Grid columns={2} gap={1}>
                                                            <Text size={0} muted>📍 {dup.location}</Text>
                                                            <Text size={0} muted>🏛️ {dup.type}</Text>
                                                        </Grid>
                                                        {dup.isVisible && (
                                                            <Badge tone="caution" fontSize={0}>Visible</Badge>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            ))}
                                        </Stack>

                                        {/* Similarity Reasons */}
                                        <Card padding={2} tone="transparent">
                                            <Stack space={1}>
                                                <Text size={0} weight="semibold">Why these might be duplicates:</Text>
                                                {/* Get reasons from first match in this group */}
                                                {matches
                                                    .filter(m =>
                                                        group.colleges.some(c => c._id === m.college1._id) &&
                                                        group.colleges.some(c => c._id === m.college2._id)
                                                    )
                                                    .slice(0, 1)
                                                    .map(m => m.reasons.map((reason, idx) => (
                                                        <Text key={idx} size={0} muted>• {reason}</Text>
                                                    )))
                                                }
                                            </Stack>
                                        </Card>
                                    </Stack>
                                </Card>
                            )
                        })}
                    </Stack>
                )}
            </Stack>
        </Card>
    )
}
