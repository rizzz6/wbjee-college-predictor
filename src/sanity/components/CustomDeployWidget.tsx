import { Card, Button, Stack, Text, Spinner, Select, Flex, TextInput } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Trash2, Edit, Plus, Rocket, Check, AlertCircle } from 'lucide-react'

interface DeploymentTarget {
    _id: string
    _rev?: string
    _createdAt: string
    _updatedAt: string
    name: string
    deployHook: string
    projectId: string
    token: string
    deployLimit: number
}

export function CustomDeployWidget() {
    const client = useClient({ apiVersion: '2024-01-01' })
    const [targets, setTargets] = useState<DeploymentTarget[]>([])
    const [selectedTarget, setSelectedTarget] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isDeploying, setIsDeploying] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // Management state
    const [showManage, setShowManage] = useState(false)
    const [editingTarget, setEditingTarget] = useState<DeploymentTarget | null>(null)
    const [formData, setFormData] = useState<Partial<DeploymentTarget>>({})

    // Fetch deployment targets from Sanity
    const fetchTargets = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await client.fetch<DeploymentTarget[]>(
                `*[_type == "vercel.deploymentTarget"] | order(_updatedAt desc) {
          _id,
          _rev,
          _createdAt,
          _updatedAt,
          name,
          deployHook,
          projectId,
          token,
          deployLimit
        }`
            )
            setTargets(data)
            setSelectedTarget(prev => {
                if (data.length > 0 && !prev) {
                    return data[0]._id
                }
                return prev
            })
        } catch (error) {
            console.error('Failed to fetch deployment targets:', error)
        } finally {
            setIsLoading(false)
        }
    }, [client])

    useEffect(() => {
        fetchTargets()
    }, [fetchTargets])

    const handleDeploy = async () => {
        const target = targets.find(t => t._id === selectedTarget)
        if (!target?.deployHook) {
            alert('No deploy hook configured for this target')
            return
        }

        setIsDeploying(true)
        setStatus('idle')

        try {
            const response = await fetch(target.deployHook, { method: 'POST' })

            if (response.ok) {
                setStatus('success')
                setTimeout(() => setStatus('idle'), 5000)
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error('Deploy failed:', error)
            setStatus('error')
        } finally {
            setIsDeploying(false)
        }
    }

    const handleDelete = async (targetId: string) => {
        if (!confirm('Are you sure you want to delete this deployment target?')) {
            return
        }

        try {
            await client.delete(targetId)
            await fetchTargets()
        } catch (error) {
            console.error('Failed to delete target:', error)
            alert('Failed to delete target')
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.deployHook || !formData.projectId || !formData.token) {
            alert('Please fill in all required fields')
            return
        }

        try {
            if (editingTarget?._id) {
                // Update existing
                await client
                    .patch(editingTarget._id)
                    .set({
                        name: formData.name,
                        deployHook: formData.deployHook,
                        projectId: formData.projectId,
                        token: formData.token,
                        deployLimit: formData.deployLimit || 5,
                    })
                    .commit()
            } else {
                // Create new
                await client.create({
                    _type: 'vercel.deploymentTarget',
                    name: formData.name,
                    deployHook: formData.deployHook,
                    projectId: formData.projectId,
                    token: formData.token,
                    deployLimit: formData.deployLimit || 5,
                    teamId: null,
                })
            }

            setEditingTarget(null)
            setFormData({})
            await fetchTargets()
        } catch (error) {
            console.error('Failed to save target:', error)
            alert('Failed to save target')
        }
    }

    if (isLoading) {
        return (
            <Card padding={4}>
                <Stack space={3}>
                    <Flex justify="center">
                        <Spinner />
                    </Flex>
                    <Text size={1} muted align="center">Loading deployment targets...</Text>
                </Stack>
            </Card>
        )
    }

    // Edit/Add Dialog
    if (editingTarget || showManage) {
        return (
            <Card padding={4}>
                <Stack space={4}>
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap={2}>
                            <Rocket size={18} />
                            <Text size={2} weight="semibold">
                                {editingTarget ? `Edit: ${editingTarget.name}` : 'Manage Targets'}
                            </Text>
                        </Flex>
                        <Button
                            text="Back"
                            mode="ghost"
                            onClick={() => {
                                setEditingTarget(null)
                                setShowManage(false)
                                setFormData({})
                            }}
                        />
                    </Flex>

                    {editingTarget ? (
                        // Edit Form
                        <Stack space={3}>
                            <TextInput
                                placeholder="Target Name (e.g., Production)"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            />
                            <TextInput
                                placeholder="Vercel Project ID"
                                value={formData.projectId || ''}
                                onChange={(e) => setFormData({ ...formData, projectId: e.currentTarget.value })}
                            />
                            <TextInput
                                placeholder="Vercel Token"
                                value={formData.token || ''}
                                onChange={(e) => setFormData({ ...formData, token: e.currentTarget.value })}
                            />
                            <TextInput
                                placeholder="Deploy Hook URL"
                                value={formData.deployHook || ''}
                                onChange={(e) => setFormData({ ...formData, deployHook: e.currentTarget.value })}
                            />
                            <TextInput
                                type="number"
                                placeholder="Number of deploys to show (5)"
                                value={formData.deployLimit?.toString() || '5'}
                                onChange={(e) => setFormData({ ...formData, deployLimit: parseInt(e.currentTarget.value) || 5 })}
                            />
                            <Flex gap={2}>
                                <Button text="Save" tone="primary" onClick={handleSave} />
                                <Button text="Cancel" mode="ghost" onClick={() => {
                                    setEditingTarget(null)
                                    setFormData({})
                                }} />
                            </Flex>
                        </Stack>
                    ) : (
                        // Manage List
                        <Stack space={3}>
                            <Button
                                text="Add New Target"
                                icon={Plus}
                                tone="primary"
                                onClick={() => {
                                    setEditingTarget({} as DeploymentTarget)
                                    setFormData({ deployLimit: 5 })
                                }}
                            />

                            {targets.map((target) => (
                                <Card key={target._id} padding={3} border tone="default">
                                    <Flex justify="space-between" align="center">
                                        <Stack space={2}>
                                            <Text weight="semibold">{target.name}</Text>
                                            <Text size={1} muted>Project: {target.projectId}</Text>
                                            <Text size={1} muted>
                                                {target._createdAt
                                                    ? `Created: ${new Date(target._createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}`
                                                    : 'Created: Unknown'
                                                }
                                            </Text>
                                        </Stack>
                                        <Flex gap={2}>
                                            <Button
                                                icon={Edit}
                                                mode="ghost"
                                                tone="primary"
                                                onClick={() => {
                                                    setEditingTarget(target)
                                                    setFormData(target)
                                                }}
                                            />
                                            <Button
                                                icon={Trash2}
                                                mode="ghost"
                                                tone="critical"
                                                onClick={() => handleDelete(target._id)}
                                            />
                                        </Flex>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Card>
        )
    }

    if (targets.length === 0) {
        return (
            <Card padding={4} tone="caution">
                <Stack space={3}>
                    <Flex align="center" gap={2}>
                        <Rocket size={18} />
                        <Text size={2} weight="semibold">Deploy to Production</Text>
                    </Flex>
                    <Text size={1}>
                        No deployment targets configured.
                    </Text>
                    <Button
                        text="Add Target"
                        icon={Plus}
                        onClick={() => {
                            setEditingTarget({} as DeploymentTarget)
                            setFormData({ deployLimit: 5 })
                        }}
                    />
                </Stack>
            </Card>
        )
    }

    // Main Deploy View
    return (
        <Card padding={4} radius={2} shadow={1} tone={status === 'success' ? 'positive' : status === 'error' ? 'critical' : undefined}>
            <Stack space={3}>
                <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                        <Rocket size={18} />
                        <Text size={2} weight="semibold">
                            Deploy to Production
                        </Text>
                    </Flex>
                    <Button
                        text="Manage"
                        mode="ghost"
                        fontSize={1}
                        onClick={() => setShowManage(true)}
                    />
                </Flex>

                {targets.length > 1 && (
                    <Select
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.currentTarget.value)}
                    >
                        {targets.map((target) => (
                            <option key={target._id} value={target._id}>
                                {target.name}
                            </option>
                        ))}
                    </Select>
                )}

                {targets.length === 1 && (
                    <Text size={1} muted>
                        Target: {targets[0].name}
                    </Text>
                )}

                <Button
                    mode="default"
                    tone={status === 'success' ? 'positive' : status === 'error' ? 'critical' : 'primary'}
                    loading={isDeploying}
                    onClick={handleDeploy}
                    text={
                        isDeploying
                            ? 'Deploying...'
                            : status === 'success'
                                ? '✓ Deployed!'
                                : status === 'error'
                                    ? 'Deploy Failed - Retry?'
                                    : 'Deploy Now'
                    }
                />

                {status === 'success' && (
                    <Flex align="center" gap={2}>
                        <Check style={{ color: 'green' }} />
                        <Text size={1} muted>
                            Build started! Check Vercel dashboard for progress.
                        </Text>
                    </Flex>
                )}

                {status === 'error' && (
                    <Flex align="center" gap={2}>
                        <AlertCircle style={{ color: 'red' }} />
                        <Text size={1} style={{ color: 'red' }}>
                            Failed to trigger deploy. Check your webhook URL.
                        </Text>
                    </Flex>
                )}
            </Stack>
        </Card>
    )
}
