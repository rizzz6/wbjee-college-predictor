// Activity Log Widget
// Tracks and displays recent content changes

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Select, Card } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { Clock, FileText, Plus, Pencil, Eye, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, EmptyState } from './shared'

interface ActivityItem {
    _id: string
    _type: string
    _createdAt: string
    _updatedAt: string
    name: string
    isVisible?: boolean
    _rev?: string
    activityType?: 'created' | 'updated'
}

type ActivityType = 'all' | 'created' | 'updated'
type TimeRange = '1h' | '24h' | '7d' | '30d'

export function ActivityLogWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activityType, setActivityType] = useState<ActivityType>('all')
    const [timeRange, setTimeRange] = useState<TimeRange>('24h')
    const [autoRefresh, setAutoRefresh] = useState(false)

    const getTimeThreshold = useCallback((): string => {
        const now = new Date()
        switch (timeRange) {
            case '1h': return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
            default: return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
    }, [timeRange])

    const isNewlyCreated = useCallback((item: ActivityItem): boolean => {
        const created = new Date(item._createdAt).getTime()
        const updated = new Date(item._updatedAt).getTime()
        return (updated - created) < 60000
    }, [])

    const fetchActivities = useCallback(async () => {
        setLoading(true)
        try {
            const threshold = getTimeThreshold()
            let query = ''

            if (activityType === 'created') {
                query = `*[_type == "college" && _createdAt > $threshold] | order(_createdAt desc) [0...20]`
            } else if (activityType === 'updated') {
                query = `*[_type == "college" && _updatedAt > $threshold && dateTime(_updatedAt) > dateTime(_createdAt) + 60] | order(_updatedAt desc) [0...20]`
            } else {
                query = `*[_type == "college" && (_updatedAt > $threshold || _createdAt > $threshold)] | order(_updatedAt desc) [0...20]`
            }

            const items = await client.fetch(
                `${query} { _id, _type, _createdAt, _updatedAt, name, isVisible, _rev }`,
                { threshold }
            )

            const processedItems = items.map((item: ActivityItem) => ({
                ...item,
                activityType: isNewlyCreated(item) ? 'created' : 'updated'
            }))

            setActivities(processedItems)
        } catch (error) {
            console.error('Failed to fetch activities:', error)
        } finally {
            setLoading(false)
        }
    }, [client, activityType, getTimeThreshold, isNewlyCreated])

    useEffect(() => {
        fetchActivities()
    }, [fetchActivities])

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        if (autoRefresh) {
            interval = setInterval(fetchActivities, 30000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh, fetchActivities])



    const formatTime = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (seconds < 60) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    const navigateToDocument = (id: string) => {
        router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type: 'college' })
    }

    const getActivityIcon = (item: ActivityItem) => {
        if (item.activityType === 'created') {
            return <Plus size={14} style={{ color: '#37b24d' }} />
        }
        return <Pencil size={14} style={{ color: '#228be6' }} />
    }

    const stats = {
        total: activities.length,
        created: activities.filter((a) => a.activityType === 'created').length,
        updated: activities.filter((a) => a.activityType === 'updated').length
    }

    return (
        <WidgetCard
            title="Activity Log"
            icon={<Clock size={18} />}
            iconColor="#228be6"
            headerGradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            loading={loading}
            collapsible
            actions={
                <Flex gap={1}>
                    <Button
                        icon={RefreshCw}
                        onClick={fetchActivities}
                        disabled={loading}
                        mode="bleed"
                        style={{ color: 'white' }}
                        title="Refresh"
                    />
                    <Button
                        text={autoRefresh ? 'Auto' : 'Off'}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        mode="bleed"
                        style={{
                            color: 'white',
                            background: autoRefresh ? 'rgba(255,255,255,0.2)' : 'transparent'
                        }}
                        fontSize={0}
                        title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    />
                </Flex>
            }
            footer={autoRefresh ? (
                <Text size={0} muted style={{ textAlign: 'center' }}>
                    ⚡ Auto-refreshing every 30 seconds
                </Text>
            ) : undefined}
        >
            <Stack space={4}>
                {/* Filters */}
                <Flex gap={2}>
                    <Box flex={1}>
                        <Select
                            value={activityType}
                            onChange={(e) => setActivityType(e.currentTarget.value as ActivityType)}
                            fontSize={1}
                        >
                            <option value="all">All Activity</option>
                            <option value="created">Created Only</option>
                            <option value="updated">Updated Only</option>
                        </Select>
                    </Box>
                    <Box flex={1}>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.currentTarget.value as TimeRange)}
                            fontSize={1}
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </Select>
                    </Box>
                </Flex>

                {/* Stats */}
                <Flex gap={2}>
                    <Badge tone="default">{stats.total} Total</Badge>
                    <Badge tone="positive">{stats.created} Created</Badge>
                    <Badge tone="primary">{stats.updated} Updated</Badge>
                </Flex>

                {/* Activity List */}
                <Box
                    padding={3}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        maxHeight: '350px',
                        overflowY: 'auto'
                    }}
                >
                    {activities.length > 0 ? (
                        <Stack space={2}>
                            {activities.map((item: ActivityItem) => (
                                <Card
                                    key={`${item._id}-${item._updatedAt}`}
                                    padding={2}
                                    tone="transparent"
                                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                    onClick={() => navigateToDocument(item._id)}
                                >
                                    <Flex justify="space-between" align="center">
                                        <Flex align="center" gap={2} flex={1}>
                                            {getActivityIcon(item)}
                                            <Stack space={1} flex={1}>
                                                <Text size={1} weight="medium">{item.name}</Text>
                                                <Flex gap={2} align="center">
                                                    <Badge
                                                        tone={item.activityType === 'created' ? 'positive' : 'primary'}
                                                        fontSize={0}
                                                    >
                                                        {item.activityType === 'created' ? 'Created' : 'Updated'}
                                                    </Badge>
                                                    {item.isVisible && (
                                                        <Badge tone="positive" fontSize={0}>
                                                            <Eye size={10} style={{ marginRight: 2 }} />
                                                            Visible
                                                        </Badge>
                                                    )}
                                                </Flex>
                                            </Stack>
                                        </Flex>
                                        <Text size={0} muted>
                                            {formatTime(item._updatedAt)}
                                        </Text>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState
                            icon={<FileText size={32} />}
                            title="No activity in this time range"
                            description="Try expanding the time range"
                        />
                    )}
                </Box>
            </Stack>
        </WidgetCard>
    )
}
