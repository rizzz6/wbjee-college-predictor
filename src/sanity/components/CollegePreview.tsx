import { Card, Stack, Text, Badge, Flex } from '@sanity/ui'
import { ReactNode, useEffect, useState } from 'react'

interface CollegePreviewProps {
    title?: string
    subtitle?: string
    media?: ReactNode
    lastSyncedAt?: string
    highlights?: string[]
    estYear?: number
    type?: string
    isVisible?: boolean
}

export function CollegePreview(props: CollegePreviewProps) {
    const { title, subtitle, media, lastSyncedAt, highlights, estYear, type, isVisible } = props
    const [now, setNow] = useState<number | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNow(Date.now())
    }, [])

    const isRecent = lastSyncedAt && now ? (now - new Date(lastSyncedAt).getTime()) < 86400000 : false

    return (
        <Card padding={3}>
            <Flex align="center" gap={3}>
                {media && (
                    <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                        {media}
                    </div>
                )}
                <Stack space={2} flex={1}>
                    <Flex align="center" gap={2}>
                        <Text weight="semibold" size={2}>{title}</Text>
                        {!isVisible && (
                            <Badge tone="critical" fontSize={0}>Hidden</Badge>
                        )}
                    </Flex>

                    {subtitle && <Text size={1} muted>{subtitle}</Text>}

                    <Flex gap={2} wrap="wrap">
                        {type && (
                            <Badge tone={type === 'Government' ? 'primary' : 'default'} fontSize={0}>
                                {type}
                            </Badge>
                        )}

                        {estYear && (
                            <Badge tone="positive" fontSize={0}>
                                Est. {estYear}
                            </Badge>
                        )}

                        {lastSyncedAt ? (
                            <Badge tone={isRecent ? 'positive' : 'caution'} fontSize={0}>
                                {isRecent ? 'Synced Recently' : 'Outdated'}
                            </Badge>
                        ) : (
                            <Badge tone="critical" fontSize={0}>
                                Never Synced
                            </Badge>
                        )}

                        {highlights && highlights.length > 0 && (
                            <Badge tone="default" fontSize={0}>
                                {highlights.length} highlights
                            </Badge>
                        )}
                    </Flex>
                </Stack>
            </Flex>
        </Card>
    )
}
