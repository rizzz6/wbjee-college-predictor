// Data Actions Widget for Sanity Dashboard
// Provides data management actions and statistics overview

'use client'

import { Stack, Text, Button, Box, Grid, Card } from '@sanity/ui'
import { BarChart3, CheckCircle2, RefreshCw, FileDown, FileUp, Trash2, Database } from 'lucide-react'
import { useSanityStats } from '../utils/hooks/useSanityStats'
import { useSanityActions } from '../utils/hooks/useSanityActions'
import { WidgetCard, StatsGrid, EmptyState } from './shared'

export function DataActionsWidget() {
    const { loading, error, data, refetch } = useSanityStats()
    const {
        handleExport, handleDelete, handleImport, handlePublish, handleValidate, handleRebuild,
        exporting, deleting, importing, publishing, validating, rebuilding, validationIssues
    } = useSanityActions()

    if (error) {
        return (
            <WidgetCard title="Data Actions" icon={<Database size={18} />} iconColor="#ef4444">
                <EmptyState title="Error loading data" description={error} />
                <Button text="Retry" onClick={refetch} mode="ghost" tone="critical" />
            </WidgetCard>
        )
    }

    if (!data) return null

    const { stats } = data

    return (
        <WidgetCard
            title="Data Actions"
            icon={<Database size={18} />}
            iconColor="#6366f1"
            headerGradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            loading={loading}
            collapsible
            actions={<Button icon={RefreshCw} onClick={refetch} mode="bleed" style={{ color: 'white' }} />}
        >
            <Stack space={4}>
                {/* Quick Stats */}
                <StatsGrid
                    columns={4}
                    stats={[
                        { label: 'Total', value: stats.total },
                        { label: 'Visible', value: stats.visible, tone: 'positive' },
                        { label: 'Quality', value: `${stats.qualityScore}%`, tone: stats.qualityScore >= 80 ? 'positive' : 'caution' },
                        { label: 'Drafts', value: stats.drafts }
                    ]}
                />

                {/* Data Management */}
                <Box padding={3} style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>DATA MANAGEMENT</Text>
                        <Grid columns={2} gap={2}>
                            <Button mode="ghost" text={exporting ? '...' : 'Export JSON'} icon={FileDown} fontSize={1} onClick={() => handleExport('json').then(() => refetch())} disabled={exporting || deleting || importing} tone="primary" />
                            <Button mode="ghost" text={exporting ? '...' : 'Export CSV'} icon={FileDown} fontSize={1} onClick={() => handleExport('csv').then(() => refetch())} disabled={exporting || deleting || importing} tone="primary" />
                            <Button mode="ghost" text={importing ? '...' : 'Import JSON'} icon={FileUp} fontSize={1} onClick={() => handleImport().then(() => refetch())} disabled={exporting || deleting || importing} tone="positive" />
                            <Button mode="ghost" text={deleting ? '...' : 'Delete All'} icon={Trash2} fontSize={1} onClick={() => handleDelete().then(() => refetch())} disabled={exporting || deleting || importing} tone="critical" />
                        </Grid>
                    </Stack>
                </Box>

                {/* Publishing */}
                <Box padding={3} style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>PUBLISHING</Text>
                        <Button mode="ghost" text={publishing ? 'Publishing...' : `Publish Drafts (${stats.drafts})`} icon={CheckCircle2} fontSize={1} onClick={() => handlePublish().then(() => refetch())} disabled={publishing || stats.drafts === 0} tone="positive" />
                        <Button mode="ghost" text={validating ? 'Validating...' : 'Validate All'} icon={BarChart3} fontSize={1} onClick={handleValidate} disabled={validating} tone="primary" />
                    </Stack>
                </Box>

                {/* Validation Issues */}
                {validationIssues.length > 0 && (
                    <Card tone="caution" padding={3} radius={2}>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">{validationIssues.length} issues found</Text>
                            <Box style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                {validationIssues.slice(0, 3).map((issue) => (
                                    <Box key={issue.collegeId} paddingY={1}>
                                        <Text size={0}><strong>{issue.collegeName}</strong>: {issue.issues.join(', ')}</Text>
                                    </Box>
                                ))}
                                {validationIssues.length > 3 && <Text size={0} muted>+{validationIssues.length - 3} more</Text>}
                            </Box>
                        </Stack>
                    </Card>
                )}

                {/* Rebuild */}
                <Box padding={3} style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                    <Stack space={2}>
                        <Text size={0} weight="semibold" muted>SITE REBUILD</Text>
                        <Button mode="ghost" text={rebuilding ? 'Rebuilding...' : 'Rebuild Site'} icon={RefreshCw} fontSize={1} onClick={() => handleRebuild()} disabled={rebuilding} tone="caution" />
                        <Text size={0} muted>Triggers full rebuild of all static pages</Text>
                    </Stack>
                </Box>

                {/* Status */}
                <StatsGrid
                    columns={2}
                    stats={[
                        { label: 'Recently Synced', value: stats.synced, tone: stats.synced > 0 ? 'positive' : 'default' },
                        { label: 'Never Synced', value: stats.unsynced, tone: stats.unsynced > 0 ? 'caution' : 'default' }
                    ]}
                />
            </Stack>
        </WidgetCard>
    )
}
