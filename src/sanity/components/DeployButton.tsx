import React, { useState } from 'react'
import { Card, Button, Stack, Text } from '@sanity/ui'

interface DeployButtonProps {
    deployHookUrl: string
    title?: string
}

export function DeployButton({ deployHookUrl, title = 'Deploy to Production' }: DeployButtonProps) {
    const [isDeploying, setIsDeploying] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleDeploy = async () => {
        setIsDeploying(true)
        setStatus('idle')

        try {
            const response = await fetch(deployHookUrl, { method: 'POST' })

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

    return (
        <Card padding={4} radius={2} shadow={1}>
            <Stack space={3}>
                <Text size={2} weight="semibold">
                    🚀 {title}
                </Text>

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
                    <Text size={1} muted>
                        Build started! Check Vercel dashboard for progress.
                    </Text>
                )}

                {status === 'error' && (
                    <Text size={1} style={{ color: 'red' }}>
                        Failed to trigger deploy. Check your webhook URL.
                    </Text>
                )}
            </Stack>
        </Card>
    )
}
