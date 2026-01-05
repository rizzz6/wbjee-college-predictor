// Dashboard Tabs - Tabbed navigation for organized widget display
// Groups 16 widgets into 5 logical categories

'use client'

import { Card, Stack, Flex, Text, Box } from '@sanity/ui'
import { useState, useEffect, ReactNode, lazy, Suspense } from 'react'
import {
    LayoutDashboard, ShieldCheck, Wrench, Database, Rocket,
    BarChart3, Zap, Clock, CheckCircle, Search, Link, Users,
    Layers, Eye, FileText, Upload, Download, Shield, RefreshCw
} from 'lucide-react'

// Tab configuration
interface TabConfig {
    id: string
    label: string
    icon: any
    color: string
    description: string
}

const TABS: TabConfig[] = [
    {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        color: '#6366f1',
        description: 'Analytics, quick actions, and activity'
    },
    {
        id: 'quality',
        label: 'Quality',
        icon: ShieldCheck,
        color: '#10b981',
        description: 'Data health and validation tools'
    },
    {
        id: 'operations',
        label: 'Operations',
        icon: Wrench,
        color: '#f59e0b',
        description: 'Bulk actions and content management'
    },
    {
        id: 'data',
        label: 'Data',
        icon: Database,
        color: '#3b82f6',
        description: 'Import, export, and backup'
    },
    {
        id: 'deploy',
        label: 'Deploy',
        icon: Rocket,
        color: '#ef4444',
        description: 'Publishing and deployment'
    }
]

// Widget mapping to tabs
const TAB_WIDGETS: Record<string, string[]> = {
    overview: ['analytics', 'quick-actions', 'activity-log'],
    quality: ['data-quality', 'smart-validation', 'seo-analyzer', 'link-checker', 'duplicate-detection'],
    operations: ['batch-operations', 'visibility', 'bulk-seo', 'bulk-media-upload'],
    data: ['export-templates', 'backup-restore'],
    deploy: ['deploy-production', 'actions']
}

interface DashboardTabsProps {
    children: ReactNode
    widgetMap: Record<string, ReactNode>
}

export function DashboardTabs({ widgetMap }: { widgetMap: Record<string, ReactNode> }) {
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sanity-dashboard-tab') || 'overview'
        }
        return 'overview'
    })

    useEffect(() => {
        localStorage.setItem('sanity-dashboard-tab', activeTab)
    }, [activeTab])

    const activeTabConfig = TABS.find(t => t.id === activeTab)
    const activeWidgets = TAB_WIDGETS[activeTab] || []

    return (
        <Stack space={4}>
            {/* Tab Navigation */}
            <Card padding={2} radius={3} style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <Flex gap={1} wrap="wrap">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const widgetCount = TAB_WIDGETS[tab.id]?.length || 0

                        return (
                            <Box
                                key={tab.id}
                                as="button"
                                padding={3}
                                style={{
                                    border: 'none',
                                    background: isActive ? tab.color : 'transparent',
                                    color: isActive ? 'white' : 'inherit',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flex: 1,
                                    minWidth: 'fit-content',
                                    justifyContent: 'center'
                                }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} />
                                <Text
                                    size={1}
                                    weight={isActive ? 'semibold' : 'regular'}
                                    style={{ color: 'inherit' }}
                                >
                                    {tab.label}
                                </Text>
                                <Box
                                    style={{
                                        background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                        padding: '2px 6px',
                                        borderRadius: 10,
                                        fontSize: 10,
                                        fontWeight: 600
                                    }}
                                >
                                    {widgetCount}
                                </Box>
                            </Box>
                        )
                    })}
                </Flex>
            </Card>

            {/* Tab Description */}
            <Flex align="center" gap={2} style={{ opacity: 0.6 }}>
                {activeTabConfig && (
                    <>
                        <activeTabConfig.icon size={14} />
                        <Text size={0}>{activeTabConfig.description}</Text>
                    </>
                )}
            </Flex>

            {/* Tab Content - Grid of widgets */}
            <Box
                key={activeTab}
                style={{
                    animation: 'tab-enter 0.25s ease'
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: 16
                    }}
                >
                    {activeWidgets.map(widgetId => {
                        const widget = widgetMap[widgetId]
                        if (!widget) return null

                        return (
                            <Box key={widgetId}>
                                {widget}
                            </Box>
                        )
                    })}
                </div>
            </Box>

            {/* CSS Animation */}
            <style>{`
                @keyframes tab-enter {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </Stack>
    )
}

// Tab Panel wrapper for individual tabs
interface TabPanelProps {
    id: string
    activeTab: string
    children: ReactNode
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
    if (id !== activeTab) return null

    return (
        <Box style={{ animation: 'tab-enter 0.25s ease' }}>
            {children}
        </Box>
    )
}

// Export tab configuration for use in main config
export { TABS, TAB_WIDGETS }
