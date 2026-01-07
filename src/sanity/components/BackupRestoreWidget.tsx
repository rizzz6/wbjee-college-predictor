// Backup & Restore Widget
// Create and restore data backups

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Select } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Database, Download, Upload, Clock, Trash2, Shield, HardDrive } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, StatsGrid } from './shared'

interface BackupMetadata {
    id: string
    name: string
    timestamp: string
    documentCount: number
    size: string
    type: 'full' | 'colleges' | 'custom'
}

interface BackupData {
    metadata: BackupMetadata
    documents: Record<string, unknown>[]
}

export function BackupRestoreWidget() {
    const client = useClient({ apiVersion })
    const [backups, setBackups] = useState<BackupMetadata[]>([])
    const [creating, setCreating] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [backupType, setBackupType] = useState<'full' | 'colleges'>('colleges')
    const [lastBackup, setLastBackup] = useState<string | null>(null)
    const [stats, setStats] = useState({ colleges: 0, posts: 0, settings: 0 })
    const [loading, setLoading] = useState(true)

    const loadBackups = useCallback(() => {
        try {
            const stored = localStorage.getItem('sanity-backups-metadata')
            if (stored) setBackups(JSON.parse(stored))
            const last = localStorage.getItem('sanity-last-backup')
            if (last) setLastBackup(last)
        } catch (error) {
            console.error('Failed to load backups:', error)
        }
    }, [])

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const [colleges, posts, settings] = await Promise.all([
                client.fetch<number>('count(*[_type == "college"])'),
                client.fetch<number>('count(*[_type == "post"])'),
                client.fetch<number>('count(*[_type == "siteSettings"])')
            ])
            setStats({ colleges, posts, settings })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }, [client])

    useEffect(() => {
        loadBackups()
        fetchStats()
    }, [loadBackups, fetchStats])

    const createBackup = async () => {
        setCreating(true)
        try {
            let query = backupType === 'full'
                ? '*[_type in ["college", "collegeCutoff", "collegeDetail", "post", "author", "category", "siteSettings", "timeline"]]'
                : '*[_type == "college"]'

            const documents = await client.fetch(query)

            const metadata: BackupMetadata = {
                id: `backup-${Date.now()}`,
                name: `${backupType === 'full' ? 'Full' : 'Colleges'} Backup`,
                timestamp: new Date().toISOString(),
                documentCount: documents.length,
                size: formatBytes(new Blob([JSON.stringify(documents)]).size),
                type: backupType
            }

            const backup: BackupData = { metadata, documents }
            const dataStr = JSON.stringify(backup, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `sanity-backup-${backupType}-${new Date().toISOString().split('T')[0]}.json`
            link.click()
            URL.revokeObjectURL(url)

            const updatedBackups = [metadata, ...backups].slice(0, 10)
            setBackups(updatedBackups)
            localStorage.setItem('sanity-backups-metadata', JSON.stringify(updatedBackups))
            localStorage.setItem('sanity-last-backup', metadata.timestamp)
            setLastBackup(metadata.timestamp)

            alert(`✓ Backup created!\n${documents.length} documents backed up.`)
        } catch (error) {
            console.error('Backup failed:', error)
            alert('Backup failed. See console for details.')
        } finally {
            setCreating(false)
        }
    }

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setRestoring(true)
        try {
            const text = await file.text()
            const backup: BackupData = JSON.parse(text)

            if (!backup.metadata || !backup.documents) {
                throw new Error('Invalid backup file format')
            }

            const confirmed = window.confirm(
                `⚠️ RESTORE BACKUP\n\n` +
                `Restore ${backup.documents.length} documents from:\n` +
                `${backup.metadata.name}\n` +
                `Created: ${new Date(backup.metadata.timestamp).toLocaleString()}\n\n` +
                `Existing documents will be OVERWRITTEN.\n\nContinue?`
            )

            if (!confirmed) {
                setRestoring(false)
                return
            }

            const batchSize = 50
            let restored = 0, failed = 0

            for (let i = 0; i < backup.documents.length; i += batchSize) {
                const batch = backup.documents.slice(i, i + batchSize)
                const transaction = client.transaction()
                batch.forEach((doc: Record<string, unknown>) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { _rev, ...docWithoutRev } = doc
                    // Ensure _id and _type exist (required by Sanity)
                    if (docWithoutRev._id && typeof docWithoutRev._id === 'string' &&
                        docWithoutRev._type && typeof docWithoutRev._type === 'string') {
                        transaction.createOrReplace(docWithoutRev as { _id: string; _type: string;[key: string]: unknown })
                    }
                })
                try {
                    await transaction.commit()
                    restored += batch.length
                } catch {
                    failed += batch.length
                }
            }

            alert(`✓ Restored: ${restored} documents\n✗ Failed: ${failed} documents`)
            fetchStats()
        } catch {
            alert('Restore failed. Make sure it\'s a valid backup file.')
        } finally {
            setRestoring(false)
            event.target.value = ''
        }
    }

    const deleteBackupMetadata = (id: string) => {
        const updated = backups.filter(b => b.id !== id)
        setBackups(updated)
        localStorage.setItem('sanity-backups-metadata', JSON.stringify(updated))
    }

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    const getTimeSinceBackup = (): string => {
        if (!lastBackup) return 'Never'
        const diff = Date.now() - new Date(lastBackup).getTime()
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return new Date(lastBackup).toLocaleDateString()
    }

    const shouldBackup = (): boolean => {
        if (!lastBackup) return true
        return (Date.now() - new Date(lastBackup).getTime()) / 86400000 > 7
    }

    return (
        <WidgetCard
            title="Backup & Restore"
            icon={<Shield size={18} />}
            iconColor="#10b981"
            headerGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            loading={loading}
            collapsible
            actions={shouldBackup() && (
                <Badge tone="caution" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    Backup Needed
                </Badge>
            )}
            footer={
                <Text size={0} muted style={{ textAlign: 'center' }}>
                    💡 Tip: Create backups before major changes
                </Text>
            }
        >
            <Stack space={4}>
                {/* Stats */}
                <StatsGrid
                    columns={3}
                    stats={[
                        { label: 'Colleges', value: stats.colleges, tone: 'primary' },
                        { label: 'Posts', value: stats.posts },
                        { label: 'Last Backup', value: getTimeSinceBackup() }
                    ]}
                />

                {/* Backup Controls */}
                <Box padding={3} style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Flex align="center" gap={2}>
                            <Download size={16} />
                            <Text size={1} weight="semibold">Create Backup</Text>
                        </Flex>
                        <Flex gap={2}>
                            <Box flex={1}>
                                <Select
                                    value={backupType}
                                    onChange={(e) => setBackupType(e.currentTarget.value as 'full' | 'colleges')}
                                    fontSize={1}
                                >
                                    <option value="colleges">Colleges Only ({stats.colleges})</option>
                                    <option value="full">Full Backup (All)</option>
                                </Select>
                            </Box>
                            <Button
                                text={creating ? 'Creating...' : 'Backup'}
                                icon={Database}
                                onClick={createBackup}
                                disabled={creating}
                                tone="positive"
                                fontSize={1}
                            />
                        </Flex>
                    </Stack>
                </Box>

                {/* Restore Controls */}
                <Box padding={3} style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Flex align="center" gap={2}>
                            <Upload size={16} />
                            <Text size={1} weight="semibold">Restore from Backup</Text>
                        </Flex>
                        <Box>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                disabled={restoring}
                                style={{ display: 'none' }}
                                id="restore-input"
                            />
                            <label htmlFor="restore-input">
                                <Button
                                    as="span"
                                    text={restoring ? 'Restoring...' : 'Select File'}
                                    icon={Upload}
                                    disabled={restoring}
                                    mode="ghost"
                                    fontSize={1}
                                    style={{ cursor: restoring ? 'not-allowed' : 'pointer' }}
                                />
                            </label>
                        </Box>
                        <Text size={0} muted>⚠️ Will overwrite existing documents</Text>
                    </Stack>
                </Box>

                {/* Backup History */}
                {backups.length > 0 && (
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Flex align="center" gap={2}>
                                <Clock size={14} />
                                <Text size={1} weight="semibold">History</Text>
                                <Badge tone="default">{backups.length}</Badge>
                            </Flex>
                            <Stack space={1} style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {backups.map(backup => (
                                    <Flex key={backup.id} justify="space-between" align="center">
                                        <Stack space={0}>
                                            <Flex align="center" gap={2}>
                                                <HardDrive size={12} style={{ opacity: 0.5 }} />
                                                <Text size={1}>{backup.name}</Text>
                                                <Badge tone="primary" fontSize={0}>{backup.size}</Badge>
                                            </Flex>
                                            <Text size={0} muted>{formatDate(backup.timestamp)}</Text>
                                        </Stack>
                                        <Button
                                            icon={Trash2}
                                            mode="bleed"
                                            tone="critical"
                                            onClick={() => deleteBackupMetadata(backup.id)}
                                            fontSize={0}
                                        />
                                    </Flex>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
