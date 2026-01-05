// WidgetCard - Consistent wrapper for all dashboard widgets
// Provides collapsible functionality, consistent styling, and loading states

'use client'

import { Card, Stack, Flex, Text, Button, Box } from '@sanity/ui'
import { useState, ReactNode } from 'react'
import { ChevronDown, MoreVertical } from 'lucide-react'

interface WidgetCardProps {
    title: string
    icon?: ReactNode
    iconColor?: string
    children: ReactNode
    loading?: boolean
    error?: string
    collapsible?: boolean
    defaultCollapsed?: boolean
    headerGradient?: string
    actions?: ReactNode
    footer?: ReactNode
    compact?: boolean
}

export function WidgetCard({
    title,
    icon,
    iconColor = '#6366f1',
    children,
    loading = false,
    error,
    collapsible = true,
    defaultCollapsed = false,
    headerGradient,
    actions,
    footer,
    compact = false
}: WidgetCardProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)

    const toggleCollapse = () => {
        if (collapsible) {
            setCollapsed(!collapsed)
        }
    }

    return (
        <Card
            padding={0}
            radius={3}
            style={{
                overflow: 'hidden',
                transition: 'box-shadow 0.25s ease',
            }}
        >
            {/* Header */}
            <Box
                padding={3}
                style={{
                    background: headerGradient || 'transparent',
                    borderBottom: headerGradient ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    cursor: collapsible ? 'pointer' : 'default'
                }}
                onClick={toggleCollapse}
            >
                <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                        {icon && (
                            <Box style={{ color: headerGradient ? 'white' : iconColor }}>
                                {icon}
                            </Box>
                        )}
                        <Text
                            size={1}
                            weight="semibold"
                            style={{ color: headerGradient ? 'white' : 'inherit' }}
                        >
                            {title}
                        </Text>
                    </Flex>

                    <Flex align="center" gap={1}>
                        {actions && (
                            <Box onClick={(e) => e.stopPropagation()}>
                                {actions}
                            </Box>
                        )}
                        {collapsible && (
                            <Button
                                icon={ChevronDown}
                                mode="bleed"
                                style={{
                                    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.25s ease',
                                    color: headerGradient ? 'white' : 'inherit',
                                    opacity: 0.7
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleCollapse()
                                }}
                            />
                        )}
                    </Flex>
                </Flex>
            </Box>

            {/* Content */}
            <Box
                style={{
                    maxHeight: collapsed ? 0 : 2000,
                    opacity: collapsed ? 0 : 1,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.2s ease'
                }}
            >
                {loading ? (
                    <Box padding={compact ? 3 : 4}>
                        <LoadingSkeleton lines={3} />
                    </Box>
                ) : error ? (
                    <Box padding={compact ? 3 : 4}>
                        <Card padding={3} tone="critical" radius={2}>
                            <Text size={1}>{error}</Text>
                        </Card>
                    </Box>
                ) : (
                    <Box padding={compact ? 3 : 4}>
                        {children}
                    </Box>
                )}

                {/* Footer */}
                {footer && !collapsed && (
                    <Box
                        padding={3}
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.02)'
                        }}
                    >
                        {footer}
                    </Box>
                )}
            </Box>
        </Card>
    )
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
    lines?: number
    showTitle?: boolean
}

export function LoadingSkeleton({ lines = 3, showTitle = false }: LoadingSkeletonProps) {
    return (
        <Stack space={3}>
            {showTitle && (
                <Box
                    style={{
                        height: 20,
                        width: '60%',
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                        borderRadius: 4
                    }}
                />
            )}
            {Array.from({ length: lines }).map((_, i) => (
                <Box
                    key={i}
                    style={{
                        height: 14,
                        width: `${100 - (i * 15)}%`,
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                        borderRadius: 4
                    }}
                />
            ))}
        </Stack>
    )
}

// Stats Grid Component
interface Stat {
    label: string
    value: string | number
    tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
    icon?: ReactNode
    change?: string
}

interface StatsGridProps {
    stats: Stat[]
    columns?: 2 | 3 | 4 | 5
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
    const getToneColor = (tone?: string) => {
        switch (tone) {
            case 'positive': return '#10b981'
            case 'caution': return '#f59e0b'
            case 'critical': return '#ef4444'
            case 'primary': return '#6366f1'
            default: return undefined
        }
    }

    return (
        <Flex gap={2} wrap="wrap">
            {stats.map((stat, i) => (
                <Card
                    key={i}
                    padding={3}
                    tone={stat.tone || 'default'}
                    radius={2}
                    style={{
                        flex: `1 1 calc(${100 / columns}% - 8px)`,
                        minWidth: 80,
                        textAlign: 'center',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <Stack space={1}>
                        {stat.icon && (
                            <Box style={{ color: getToneColor(stat.tone), opacity: 0.8 }}>
                                {stat.icon}
                            </Box>
                        )}
                        <Text
                            size={3}
                            weight="bold"
                            style={{ color: getToneColor(stat.tone) }}
                        >
                            {stat.value}
                        </Text>
                        <Text size={0} muted style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {stat.label}
                        </Text>
                        {stat.change && (
                            <Text size={0} style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                                {stat.change}
                            </Text>
                        )}
                    </Stack>
                </Card>
            ))}
        </Flex>
    )
}

// Action Bar Component
interface Action {
    label: string
    icon?: ReactNode
    onClick: () => void
    tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
    disabled?: boolean
    loading?: boolean
}

interface ActionBarProps {
    actions: Action[]
    align?: 'left' | 'center' | 'right'
}

export function ActionBar({ actions, align = 'left' }: ActionBarProps) {
    const justifyMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
    }

    return (
        <Flex gap={2} wrap="wrap" justify={justifyMap[align] as any}>
            {actions.map((action, i) => (
                <Button
                    key={i}
                    text={action.label}
                    icon={action.icon}
                    onClick={action.onClick}
                    tone={action.tone}
                    disabled={action.disabled || action.loading}
                    mode="ghost"
                    fontSize={1}
                />
            ))}
        </Flex>
    )
}

// Progress Bar Component
interface ProgressBarProps {
    value: number
    max?: number
    color?: string
    animated?: boolean
    showLabel?: boolean
}

export function ProgressBar({
    value,
    max = 100,
    color = '#6366f1',
    animated = false,
    showLabel = false
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100)

    return (
        <Stack space={1}>
            {showLabel && (
                <Flex justify="space-between">
                    <Text size={0} muted>Progress</Text>
                    <Text size={0} muted>{Math.round(percentage)}%</Text>
                </Flex>
            )}
            <Box
                style={{
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: color,
                        borderRadius: 2,
                        transition: 'width 0.3s ease',
                        animation: animated ? 'progress-glow 2s ease-in-out infinite' : 'none'
                    }}
                />
            </Box>
        </Stack>
    )
}

// Empty State Component
interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Stack space={3} style={{ textAlign: 'center', padding: '32px 16px' }}>
            {icon && (
                <Box style={{ opacity: 0.2 }}>
                    {icon}
                </Box>
            )}
            <Text size={1} weight="medium">{title}</Text>
            {description && (
                <Text size={1} muted>{description}</Text>
            )}
            {action && (
                <Box style={{ marginTop: 8 }}>
                    {action}
                </Box>
            )}
        </Stack>
    )
}
