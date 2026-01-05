// Data Actions Widget for Sanity Dashboard
// Provides data management actions and statistics overview

'use client'

import { Card, Stack, Heading, Text, Grid, Badge, Spinner, Button, Box } from '@sanity/ui'
import { BarChart3, Upload, CheckCircle2, RefreshCw, FileDown, FileUp, Trash2 } from 'lucide-react'
import { useSanityStats } from '../utils/hooks/useSanityStats'
import { useSanityActions } from '../utils/hooks/useSanityActions'

export function DataActionsWidget() {
    const { loading, error, data, refetch } = useSanityStats()
    const {
        handleExport,
        handleDelete,
        handleImport,
        handlePublish,
        handleValidate,
        handleRebuild,
        exporting,
        deleting,
        importing,
        publishing,
        validating,
        rebuilding,
        validationIssues
    } = useSanityActions()

    if (loading) {
        return (
            <Card padding={4}>
                <Stack space={3}>
                    <Spinner />
                    <Text size={1} muted>Loading statistics...</Text>
                </Stack>
            </Card>
        )
    }

    if (error) {
        return (
            <Card padding={4} tone="critical">
                <Stack space={2}>
                    <Text size={1} weight="semibold">Error loading data</Text>
                    <Text size={1}>{error}</Text>
                    <Button text="Retry" onClick={refetch} mode="ghost" tone="critical" />
                </Stack>
            </Card>
        )
    }

    if (!data) return null

    const { stats } = data

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Box>
                    <Heading size={1}>Data Actions</Heading>
                    <Text size={1} muted>Manage college data and trigger builds</Text>
                </Box>

                {/* Quick Stats */}
                <Grid columns={[2, 2, 4]} gap={2}>
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={0} muted>Total</Text>
                            <Text size={3} weight="bold">{stats.total}</Text>
                        </Stack>
                    </Card>
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={0} muted>Visible</Text>
                            <Text size={3} weight="bold">{stats.visible}</Text>
                        </Stack>
                    </Card>
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={0} muted>Quality</Text>
                            <Text size={3} weight="bold">{stats.qualityScore}%</Text>
                        </Stack>
                    </Card>
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={0} muted>Drafts</Text>
                            <Text size={3} weight="bold">{stats.drafts}</Text>
                        </Stack>
                    </Card>
                </Grid>

                {/* Data Management Actions */}
                <Box>
                    <Text size={1} weight="semibold" muted style={{ marginBottom: 8 }}>
                        Data Management
                    </Text>
                    <Grid columns={2} gap={2}>
                        <Button
                            mode="ghost"
                            text={exporting ? 'Exporting...' : 'Export JSON'}
                            icon={FileDown}
                            fontSize={1}
                            onClick={() => handleExport('json').then(() => refetch())}
                            disabled={exporting || deleting || importing}
                            tone="primary"
                        />
                        <Button
                            mode="ghost"
                            text={exporting ? 'Exporting...' : 'Export CSV'}
                            icon={FileDown}
                            fontSize={1}
                            onClick={() => handleExport('csv').then(() => refetch())}
                            disabled={exporting || deleting || importing}
                            tone="primary"
                        />
                        <Button
                            mode="ghost"
                            text={importing ? 'Importing...' : 'Import JSON'}
                            icon={FileUp}
                            fontSize={1}
                            onClick={() => handleImport().then(() => refetch())}
                            disabled={exporting || deleting || importing}
                            tone="positive"
                        />
                        <Button
                            mode="ghost"
                            text={deleting ? 'Deleting...' : 'Delete All'}
                            icon={Trash2}
                            fontSize={1}
                            onClick={() => handleDelete().then(() => refetch())}
                            disabled={exporting || deleting || importing}
                            tone="critical"
                        />
                    </Grid>
                </Box>

                {/* Publishing Actions */}
                <Box>
                    <Text size={1} weight="semibold" muted style={{ marginBottom: 8 }}>
                        Publishing & Validation
                    </Text>
                    <Grid columns={1} gap={2}>
                        <Button
                            mode="ghost"
                            text={publishing ? 'Publishing...' : `Publish All Drafts (${stats.drafts})`}
                            icon={CheckCircle2}
                            fontSize={1}
                            onClick={() => handlePublish().then(() => refetch())}
                            disabled={publishing || stats.drafts === 0}
                            tone="positive"
                        />
                        <Button
                            mode="ghost"
                            text={validating ? 'Validating...' : 'Validate All Colleges'}
                            icon={BarChart3}
                            fontSize={1}
                            onClick={handleValidate}
                            disabled={validating}
                            tone="primary"
                        />
                    </Grid>
                </Box>

                {/* Validation Results */}
                {validationIssues.length > 0 && (
                    <Card tone="caution" padding={3}>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">
                                Validation Issues: {validationIssues.length} colleges
                            </Text>
                            <Box style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {validationIssues.slice(0, 5).map((issue) => (
                                    <Box key={issue.collegeId} paddingY={1}>
                                        <Text size={1}>
                                            <strong>{issue.collegeName}</strong>: {issue.issues.join(', ')}
                                        </Text>
                                    </Box>
                                ))}
                                {validationIssues.length > 5 && (
                                    <Text size={1} muted>
                                        ... and {validationIssues.length - 5} more
                                    </Text>
                                )}
                            </Box>
                        </Stack>
                    </Card>
                )}

                {/* Rebuild Action */}
                <Box>
                    <Text size={1} weight="semibold" muted style={{ marginBottom: 8 }}>
                        Site Rebuild
                    </Text>
                    <Button
                        mode="default"
                        text={rebuilding ? 'Rebuilding...' : 'Rebuild Site'}
                        icon={RefreshCw}
                        fontSize={1}
                        onClick={() => handleRebuild()}
                        disabled={rebuilding}
                        tone="caution"
                    />
                    <Text size={0} muted style={{ marginTop: 8, display: 'block' }}>
                        Triggers full rebuild of all static pages
                    </Text>
                </Box>

                {/* Status Indicators */}
                <Grid columns={2} gap={2}>
                    <Card padding={2} tone={stats.synced > 0 ? 'positive' : 'default'}>
                        <Stack space={1}>
                            <Text size={0} muted>Recently Synced</Text>
                            <Text size={1} weight="semibold">{stats.synced} colleges</Text>
                        </Stack>
                    </Card>
                    <Card padding={2} tone={stats.unsynced > 0 ? 'caution' : 'default'}>
                        <Stack space={1}>
                            <Text size={0} muted>Never Synced</Text>
                            <Text size={1} weight="semibold">{stats.unsynced} colleges</Text>
                        </Stack>
                    </Card>
                </Grid>
            </Stack>
        </Card>
    )
}
