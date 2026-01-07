// Quick Actions Panel Widget
// Provides fast access to common tasks and recent actions

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Grid, TextInput } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import {
    Zap, Search, Plus, Eye, EyeOff, RefreshCw, Download,
    CheckCircle, Star, Clock, ArrowRight
} from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard } from './shared'

interface QuickAction {
    id: string
    label: string
    icon: React.ComponentType
    action: () => void
    tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
}

interface RecentItem {
    _id: string
    _type: string
    name: string
    _updatedAt: string
}

export function QuickActionsWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [recentItems, setRecentItems] = useState<RecentItem[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const fetchRecentItems = useCallback(async () => {
        try {
            const items = await client.fetch(`
                *[_type == "college"] | order(_updatedAt desc) [0...5] {
                    _id, _type, name, _updatedAt
                }
            `)
            setRecentItems(items)
        } catch (error) {
            console.error('Failed to fetch recent items:', error)
        }
    }, [client])

    const loadFavorites = useCallback(() => {
        try {
            const stored = localStorage.getItem('sanity-favorites')
            if (stored) setFavorites(JSON.parse(stored))
        } catch (error) {
            console.error('Failed to load favorites:', error)
        }
    }, [])

    useEffect(() => {
        fetchRecentItems()
        loadFavorites()
    }, [fetchRecentItems, loadFavorites])
    const toggleFavorite = (id: string) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id]
        setFavorites(newFavorites)
        localStorage.setItem('sanity-favorites', JSON.stringify(newFavorites))
    }

    const navigateToDocument = (id: string, type: string = 'college') => {
        router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type })
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setLoading(true)
        try {
            const searchTerm = `${searchQuery}*`
            const results = await client.fetch(`
                *[_type == "college" && name match $term] | order(name asc) [0...10] {
                    _id, _type, name, _updatedAt
                }
            `, { term: searchTerm })
            setRecentItems(results)
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const quickActions: QuickAction[] = [
        {
            id: 'new-college',
            label: 'New College',
            icon: Plus,
            action: () => router.navigateIntent('create', { type: 'college' }),
            tone: 'positive'
        },
        {
            id: 'view-all',
            label: 'All Colleges',
            icon: Eye,
            action: () => router.navigateIntent('create', { type: 'college' }),
            tone: 'primary'
        },
        {
            id: 'hidden-colleges',
            label: 'Hidden',
            icon: EyeOff,
            action: async () => {
                const hidden = await client.fetch(`
                    *[_type == "college" && isVisible == false] | order(name asc) [0...10] {
                        _id, _type, name, _updatedAt
                    }
                `)
                setRecentItems(hidden)
            },
            tone: 'caution'
        },
        {
            id: 'refresh',
            label: 'Refresh',
            icon: RefreshCw,
            action: () => {
                fetchRecentItems()
                setSearchQuery('')
            }
        },
        {
            id: 'export-json',
            label: 'Export',
            icon: Download,
            action: async () => {
                const data = await client.fetch(`*[_type == "college"]`)
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `colleges-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
            },
            tone: 'primary'
        },
        {
            id: 'validation',
            label: 'Validate',
            icon: CheckCircle,
            action: () => console.log('Validation triggered'),
            tone: 'positive'
        }
    ]

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    return (
        <WidgetCard
            title="Quick Actions"
            icon={<Zap size={18} />}
            iconColor="#f59f00"
            headerGradient="linear-gradient(135deg, #f59f00 0%, #d97706 100%)"
            collapsible
            compact
        >
            <Stack space={4}>
                {/* Search */}
                <Flex gap={2}>
                    <Box flex={1}>
                        <TextInput
                            icon={Search}
                            placeholder="Search colleges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            fontSize={1}
                        />
                    </Box>
                    <Button
                        icon={Search}
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                        mode="ghost"
                    />
                </Flex>

                {/* Quick Action Buttons */}
                <Grid columns={3} gap={2}>
                    {quickActions.map(action => (
                        <Button
                            key={action.id}
                            text={action.label}
                            icon={action.icon}
                            onClick={action.action}
                            mode="ghost"
                            tone={action.tone}
                            fontSize={0}
                            style={{ justifyContent: 'flex-start' }}
                        />
                    ))}
                </Grid>

                {/* Recent Items */}
                <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <Stack space={2}>
                        <Flex justify="space-between" align="center">
                            <Flex align="center" gap={2}>
                                <Clock size={14} style={{ opacity: 0.5 }} />
                                <Text size={1} weight="semibold">
                                    {searchQuery ? 'Search Results' : 'Recent'}
                                </Text>
                            </Flex>
                            {recentItems.length > 0 && (
                                <Badge tone="default">{recentItems.length}</Badge>
                            )}
                        </Flex>

                        {loading ? (
                            <Text size={1} muted>Searching...</Text>
                        ) : recentItems.length > 0 ? (
                            <Stack space={1}>
                                {recentItems.map(item => (
                                    <Flex key={item._id} justify="space-between" align="center">
                                        <Button
                                            mode="bleed"
                                            onClick={() => navigateToDocument(item._id, item._type)}
                                            style={{ flex: 1, justifyContent: 'flex-start' }}
                                        >
                                            <Flex align="center" gap={2} style={{ width: '100%' }}>
                                                <Text size={1} style={{ flex: 1 }}>{item.name}</Text>
                                                <Text size={0} muted>{formatTime(item._updatedAt)}</Text>
                                            </Flex>
                                        </Button>
                                        <Button
                                            icon={Star}
                                            mode="bleed"
                                            tone={favorites.includes(item._id) ? 'caution' : 'default'}
                                            onClick={() => toggleFavorite(item._id)}
                                            style={{ opacity: favorites.includes(item._id) ? 1 : 0.3 }}
                                        />
                                    </Flex>
                                ))}
                            </Stack>
                        ) : (
                            <Text size={1} muted>
                                {searchQuery ? 'No results found' : 'No recent items'}
                            </Text>
                        )}
                    </Stack>
                </Box>

                {/* Favorites */}
                {favorites.length > 0 && recentItems.filter(item => favorites.includes(item._id)).length > 0 && (
                    <Box padding={3} style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Flex align="center" gap={2}>
                                <Star size={14} style={{ color: '#f59f00' }} />
                                <Text size={1} weight="semibold">Favorites</Text>
                            </Flex>
                            <Stack space={1}>
                                {recentItems
                                    .filter(item => favorites.includes(item._id))
                                    .map(item => (
                                        <Button
                                            key={item._id}
                                            mode="bleed"
                                            onClick={() => navigateToDocument(item._id, item._type)}
                                            style={{ justifyContent: 'flex-start' }}
                                        >
                                            <Flex align="center" gap={2}>
                                                <ArrowRight size={12} />
                                                <Text size={1}>{item.name}</Text>
                                            </Flex>
                                        </Button>
                                    ))
                                }
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
