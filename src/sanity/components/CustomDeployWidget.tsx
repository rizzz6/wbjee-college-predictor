// Custom Deploy Widget for Sanity Dashboard
// USES LOCALSTORAGE for security (Vercel webhooks are private)

'use client'

import { Stack, Text, Button, Box, TextInput, Grid, Flex, Badge, Card } from '@sanity/ui'
import { useState } from 'react'
import { Rocket, Plus, Trash2, ExternalLink, Clock } from 'lucide-react'
import { useDeployment } from '../utils/hooks/useDeployment'
import { validateWebhookUrl, type DeployTarget } from '../utils/deployActions'
import { WidgetCard, EmptyState } from './shared'

export function CustomDeployWidget() {
    const { targets, deploying, lastDeployed, deploy, addTarget, deleteDeployTarget } = useDeployment()

    const [showAddForm, setShowAddForm] = useState(false)
    const [newTarget, setNewTarget] = useState<Partial<DeployTarget>>({
        name: '',
        url: '',
        branch: ''
    })

    const handleAddTarget = () => {
        if (!newTarget.name || !newTarget.url) {
            return
        }

        if (!validateWebhookUrl(newTarget.url)) {
            alert('Invalid webhook URL. Must be a Vercel HTTPS URL.')
            return
        }

        const target: DeployTarget = {
            id: `deploy-${Date.now()}`,
            name: newTarget.name,
            url: newTarget.url,
            branch: newTarget.branch
        }

        addTarget(target)
        setNewTarget({ name: '', url: '', branch: '' })
        setShowAddForm(false)
    }

    const formatLastDeployed = (timestamp?: number) => {
        if (!timestamp) return null
        const diff = Date.now() - timestamp
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <WidgetCard
            title="Deploy Targets"
            icon={<Rocket size={18} />}
            iconColor="#ef4444"
            headerGradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            collapsible
            actions={
                <Button
                    mode="bleed"
                    icon={Plus}
                    text="Add"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ color: 'white' }}
                    fontSize={0}
                />
            }
            footer={
                <Flex align="center" gap={1}>
                    <ExternalLink size={12} style={{ opacity: 0.5 }} />
                    <Text size={0} muted>
                        Get webhook from Vercel → Settings → Deploy Hooks
                    </Text>
                </Flex>
            }
        >
            <Stack space={4}>
                {/* Add Target Form */}
                {showAddForm && (
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={3}>
                            <Text size={1} weight="semibold">New Deploy Target</Text>

                            <TextInput
                                placeholder="Target name (e.g., Production)"
                                value={newTarget.name || ''}
                                onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.currentTarget.value }))}
                                fontSize={1}
                            />

                            <TextInput
                                placeholder="Vercel webhook URL"
                                value={newTarget.url || ''}
                                onChange={(e) => setNewTarget(prev => ({ ...prev, url: e.currentTarget.value }))}
                                fontSize={1}
                            />

                            <TextInput
                                placeholder="Branch (optional, e.g., main)"
                                value={newTarget.branch || ''}
                                onChange={(e) => setNewTarget(prev => ({ ...prev, branch: e.currentTarget.value }))}
                                fontSize={1}
                            />

                            <Grid columns={2} gap={2}>
                                <Button
                                    mode="default"
                                    text="Save"
                                    onClick={handleAddTarget}
                                    tone="positive"
                                    disabled={!newTarget.name || !newTarget.url}
                                    fontSize={1}
                                />
                                <Button
                                    mode="ghost"
                                    text="Cancel"
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setNewTarget({ name: '', url: '', branch: '' })
                                    }}
                                    fontSize={1}
                                />
                            </Grid>
                        </Stack>
                    </Box>
                )}

                {/* Deploy Targets List */}
                {targets.length === 0 ? (
                    <EmptyState
                        icon={<Rocket size={32} />}
                        title="No deploy targets configured"
                        description="Add a Vercel webhook URL to get started"
                    />
                ) : (
                    <Stack space={2}>
                        {targets.map(target => (
                            <Card key={target.id} padding={3} border radius={2}>
                                <Stack space={3}>
                                    <Flex justify="space-between" align="center">
                                        <Stack space={1}>
                                            <Flex align="center" gap={2}>
                                                <Text size={1} weight="semibold">{target.name}</Text>
                                                {target.branch && (
                                                    <Badge tone="primary" fontSize={0}>
                                                        {target.branch}
                                                    </Badge>
                                                )}
                                            </Flex>
                                            {lastDeployed[target.id] && (
                                                <Flex align="center" gap={1}>
                                                    <Clock size={12} style={{ opacity: 0.5 }} />
                                                    <Text size={0} muted>
                                                        Last: {formatLastDeployed(lastDeployed[target.id])}
                                                    </Text>
                                                </Flex>
                                            )}
                                        </Stack>
                                        <Button
                                            mode="ghost"
                                            icon={Trash2}
                                            onClick={() => {
                                                if (confirm(`Delete "${target.name}"?`)) {
                                                    deleteDeployTarget(target.id)
                                                }
                                            }}
                                            tone="critical"
                                            fontSize={1}
                                        />
                                    </Flex>

                                    <Button
                                        mode="default"
                                        icon={Rocket}
                                        text={deploying[target.id] ? 'Deploying...' : 'Deploy Now'}
                                        onClick={() => deploy(target)}
                                        disabled={deploying[target.id]}
                                        tone="positive"
                                        fontSize={1}
                                        style={{ width: '100%' }}
                                    />
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        </WidgetCard>
    )
}
