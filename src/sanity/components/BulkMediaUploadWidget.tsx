// Bulk Media Upload Widget
// Upload and associate multiple college images at once

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Card } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { Upload, Image as ImageIcon, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, ProgressBar, EmptyState } from './shared'

interface UploadResult {
    fileName: string
    success: boolean
    collegeName?: string
    collegeId?: string
    error?: string
}

export function BulkMediaUploadWidget() {
    const client = useClient({ apiVersion })
    const [uploading, setUploading] = useState(false)
    const [results, setResults] = useState<UploadResult[]>([])
    const [progress, setProgress] = useState({ current: 0, total: 0 })

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        setResults([])
        setProgress({ current: 0, total: files.length })

        const uploadResults: UploadResult[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            setProgress({ current: i + 1, total: files.length })

            try {
                const fileName = file.name
                const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
                const collegeName = nameWithoutExt.replace(/[-_]/g, ' ').trim()

                const colleges = await client.fetch(
                    `*[_type == "college" && name match $name + "*"] | order(name asc) [0...5] { _id, name }`,
                    { name: collegeName }
                )

                if (colleges.length === 0) {
                    uploadResults.push({ fileName, success: false, error: `No match for "${collegeName}"` })
                    continue
                }

                const college = colleges[0]
                const asset = await client.assets.upload('image', file, { filename: fileName })
                await client.patch(college._id).set({
                    logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
                }).commit()

                uploadResults.push({ fileName, success: true, collegeName: college.name, collegeId: college._id })
            } catch (error) {
                uploadResults.push({ fileName: file.name, success: false, error: error instanceof Error ? error.message : 'Failed' })
            }
        }

        setResults(uploadResults)
        setUploading(false)
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return (
        <WidgetCard
            title="Bulk Media Upload"
            icon={<Upload size={18} />}
            iconColor="#8b5cf6"
            headerGradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            collapsible
        >
            <Stack space={4}>
                {/* Instructions */}
                <Box padding={3} style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8 }}>
                    <Stack space={2}>
                        <Text size={0} weight="semibold" muted>HOW IT WORKS</Text>
                        <Text size={0}>1. Name files with college names (e.g., &quot;Jadavpur University.jpg&quot;)</Text>
                        <Text size={0}>2. Select multiple image files</Text>
                        <Text size={0}>3. System auto-matches and uploads</Text>
                        <Text size={0} muted>Supports: JPG, PNG, GIF, WebP</Text>
                    </Stack>
                </Box>

                {/* Upload Button */}
                <Box>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="bulk-upload-input"
                    />
                    <label htmlFor="bulk-upload-input">
                        <Button
                            as="span"
                            text={uploading ? `${progress.current}/${progress.total}` : 'Select Images'}
                            icon={uploading ? undefined : Upload}
                            tone="primary"
                            disabled={uploading}
                            fontSize={1}
                            style={{ cursor: uploading ? 'not-allowed' : 'pointer', width: '100%' }}
                        />
                    </label>
                </Box>

                {/* Progress */}
                {uploading && <ProgressBar value={progress.current} max={progress.total} color="#8b5cf6" />}

                {/* Results Summary */}
                {!uploading && results.length > 0 && (
                    <Flex gap={2}>
                        <Badge tone="positive"><CheckCircle2 size={12} /> {successCount} Success</Badge>
                        {failCount > 0 && <Badge tone="critical"><XCircle size={12} /> {failCount} Failed</Badge>}
                    </Flex>
                )}

                {/* Results List */}
                {!uploading && results.length > 0 && (
                    <Box style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <Stack space={2}>
                            {results.map((result, idx) => (
                                <Card key={idx} padding={2} tone={result.success ? 'positive' : 'critical'} border radius={2}>
                                    <Flex gap={2} align="center">
                                        {result.success ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <XCircle size={14} style={{ color: '#ef4444' }} />}
                                        <Stack space={0} flex={1}>
                                            <Text size={1}>{result.fileName}</Text>
                                            {result.success ? (
                                                <Flex align="center" gap={1}>
                                                    <LinkIcon size={10} style={{ opacity: 0.5 }} />
                                                    <Text size={0} muted>{result.collegeName}</Text>
                                                </Flex>
                                            ) : (
                                                <Text size={0} style={{ color: '#ef4444' }}>{result.error}</Text>
                                            )}
                                        </Stack>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Empty State */}
                {!uploading && results.length === 0 && (
                    <EmptyState icon={<ImageIcon size={28} />} title="No uploads yet" description="Select images to get started" />
                )}
            </Stack>
        </WidgetCard>
    )
}
