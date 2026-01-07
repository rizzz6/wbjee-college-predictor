// Actions Widget for Sanity Dashboard
// Publishing, Rebuild, Import/Export, and Danger zone

'use client'

import { Stack, Text, Button, Grid, Box, Flex, Checkbox, Label, Card } from '@sanity/ui'
import { useState } from 'react'
import { CheckCircle2, RefreshCw, FileDown, FileUp, Trash2, Eye, Settings } from 'lucide-react'
import { useSanityActions } from '../utils/hooks/useSanityActions'
import { WidgetCard } from './shared'

export function ActionsWidget() {
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

    const [rebuildCollections, setRebuildCollections] = useState({
        college: true,
        post: true,
        category: false,
        author: false
    })

    return (
        <WidgetCard
            title="Quick Actions"
            icon={<Settings size={18} />}
            iconColor="#f59e0b"
            headerGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            collapsible
        >
            <Stack space={4}>
                {/* Publishing Section */}
                <Box padding={3} style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>PUBLISHING</Text>
                        <Grid columns={2} gap={2}>
                            <Button
                                mode="ghost"
                                text={publishing ? 'Publishing...' : 'Publish All'}
                                icon={CheckCircle2}
                                fontSize={1}
                                onClick={handlePublish}
                                disabled={publishing || exporting || deleting}
                                tone="positive"
                            />
                            <Button
                                mode="ghost"
                                text={validating ? 'Validating...' : 'Validate'}
                                icon={Eye}
                                fontSize={1}
                                onClick={handleValidate}
                                disabled={validating || exporting || deleting}
                                tone="primary"
                            />
                        </Grid>
                    </Stack>
                </Box>

                {/* Validation Results */}
                {validationIssues.length > 0 && (
                    <Card tone="caution" padding={3} radius={2}>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">
                                {validationIssues.length} issues found
                            </Text>
                            <Box style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                {validationIssues.slice(0, 5).map((issue) => (
                                    <Box key={issue.collegeId} paddingY={1}>
                                        <Text size={0}><strong>{issue.collegeName}</strong>: {issue.issues.join(', ')}</Text>
                                    </Box>
                                ))}
                                {validationIssues.length > 5 && (
                                    <Text size={0} muted>+{validationIssues.length - 5} more</Text>
                                )}
                            </Box>
                        </Stack>
                    </Card>
                )}

                {/* Rebuild Section */}
                <Box padding={3} style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>SITE REBUILD</Text>
                        <Grid columns={2} gap={2}>
                            <Flex align="center" gap={2}>
                                <Checkbox
                                    id="college-rebuild"
                                    checked={rebuildCollections.college}
                                    onChange={(e) => setRebuildCollections(prev => ({
                                        ...prev, college: (e.target as HTMLInputElement).checked
                                    }))}
                                />
                                <Label htmlFor="college-rebuild"><Text size={1}>Colleges</Text></Label>
                            </Flex>
                            <Flex align="center" gap={2}>
                                <Checkbox
                                    id="post-rebuild"
                                    checked={rebuildCollections.post}
                                    onChange={(e) => setRebuildCollections(prev => ({
                                        ...prev, post: (e.target as HTMLInputElement).checked
                                    }))}
                                />
                                <Label htmlFor="post-rebuild"><Text size={1}>Blog Posts</Text></Label>
                            </Flex>
                        </Grid>
                        <Button
                            mode="ghost"
                            text={rebuilding ? 'Rebuilding...' : 'Rebuild Selected'}
                            icon={RefreshCw}
                            fontSize={1}
                            onClick={() => {
                                const selected = Object.entries(rebuildCollections)
                                    .filter(([_, enabled]) => enabled)
                                    .map(([key]) => key)
                                handleRebuild(selected)
                            }}
                            disabled={rebuilding || exporting || deleting}
                            tone="caution"
                        />
                    </Stack>
                </Box>

                {/* Import/Export Section */}
                <Box padding={3} style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" muted>IMPORT / EXPORT</Text>
                        <Grid columns={2} gap={2}>
                            <Button
                                mode="ghost"
                                text={importing ? 'Importing...' : 'Import'}
                                icon={FileUp}
                                fontSize={1}
                                onClick={() => handleImport('json')}
                                disabled={exporting || deleting || importing}
                                tone="positive"
                            />
                            <Button
                                mode="ghost"
                                text={exporting ? 'Exporting...' : 'Export'}
                                icon={FileDown}
                                fontSize={1}
                                onClick={() => handleExport('json')}
                                disabled={exporting || deleting || importing}
                                tone="primary"
                            />
                        </Grid>
                    </Stack>
                </Box>

                {/* Danger Zone */}
                <Box padding={3} style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
                    <Stack space={3}>
                        <Text size={0} weight="semibold" style={{ color: '#ef4444' }}>⚠️ DANGER ZONE</Text>
                        <Button
                            mode="ghost"
                            text={deleting ? 'Deleting...' : 'Delete All Colleges'}
                            icon={Trash2}
                            fontSize={1}
                            onClick={handleDelete}
                            disabled={exporting || deleting || importing}
                            tone="critical"
                        />
                        <Text size={0} muted>Permanently deletes all college documents</Text>
                    </Stack>
                </Box>
            </Stack>
        </WidgetCard>
    )
}
