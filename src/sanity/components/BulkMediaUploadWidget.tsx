// Bulk Media Upload Widget
// Upload and associate multiple college images at once

'use client'

import { Card, Stack, Text, Button, Box, Badge, Spinner, Flex, Grid } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { Upload, Image as ImageIcon, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react'
import { apiVersion } from '../env'

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
                // Extract college name from filename
                // Expected format: "college-name.jpg" or "College Name.png"
                const fileName = file.name
                const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
                const collegeName = nameWithoutExt
                    .replace(/[-_]/g, ' ')
                    .trim()

                // Find matching college
                const colleges = await client.fetch(
                    `*[_type == "college" && name match $name + "*"] | order(name asc) [0...5] {
                        _id, name
                    }`,
                    { name: collegeName }
                )

                if (colleges.length === 0) {
                    uploadResults.push({
                        fileName,
                        success: false,
                        error: `No college found matching "${collegeName}"`
                    })
                    continue
                }

                // Use first match (closest match)
                const college = colleges[0]

                // Upload image to Sanity
                const asset = await client.assets.upload('image', file, {
                    filename: fileName
                })

                // Update college with logo
                await client
                    .patch(college._id)
                    .set({
                        logo: {
                            _type: 'image',
                            asset: {
                                _type: 'reference',
                                _ref: asset._id
                            }
                        }
                    })
                    .commit()

                uploadResults.push({
                    fileName,
                    success: true,
                    collegeName: college.name,
                    collegeId: college._id
                })

            } catch (error) {
                uploadResults.push({
                    fileName: file.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Upload failed'
                })
            }
        }

        setResults(uploadResults)
        setUploading(false)
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Stack space={1}>
                        <Text size={2} weight="bold">Bulk Media Upload</Text>
                        <Text size={0} muted>Upload multiple college logos at once</Text>
                    </Stack>
                    <Upload size={20} style={{ opacity: 0.5 }} />
                </Flex>

                {/* Instructions */}
                <Card padding={3} tone="primary" border>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">How it works:</Text>
                        <Stack space={1}>
                            <Text size={0}>1. Name files with college names (e.g., "Jadavpur University.jpg")</Text>
                            <Text size={0}>2. Select multiple image files</Text>
                            <Text size={0}>3. System will auto-match and upload to colleges</Text>
                            <Text size={0} muted>Supported: JPG, PNG, GIF, WebP</Text>
                        </Stack>
                    </Stack>
                </Card>

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
                            text={uploading ? `Uploading ${progress.current}/${progress.total}...` : 'Select Images'}
                            icon={uploading ? undefined : Upload}
                            tone="primary"
                            disabled={uploading}
                            fontSize={1}
                            style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                        />
                    </label>
                </Box>

                {/* Progress */}
                {uploading && (
                    <Card padding={3} tone="transparent">
                        <Stack space={2}>
                            <Flex justify="space-between">
                                <Text size={1}>Uploading...</Text>
                                <Text size={0} muted>{Math.round((progress.current / progress.total) * 100)}%</Text>
                            </Flex>
                            <Box style={{
                                width: '100%',
                                height: '4px',
                                background: '#e0e0e0',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <Box style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                    height: '100%',
                                    background: '#228be6',
                                    transition: 'width 0.3s'
                                }} />
                            </Box>
                        </Stack>
                    </Card>
                )}

                {/* Results Summary */}
                {!uploading && results.length > 0 && (
                    <Card padding={3} tone={failCount === 0 ? 'positive' : 'caution'} border>
                        <Flex justify="space-between" align="center">
                            <Text size={1} weight="semibold">Upload Complete</Text>
                            <Flex gap={2}>
                                <Badge tone="positive">
                                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                                    {successCount} Success
                                </Badge>
                                {failCount > 0 && (
                                    <Badge tone="critical">
                                        <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        {failCount} Failed
                                    </Badge>
                                )}
                            </Flex>
                        </Flex>
                    </Card>
                )}

                {/* Results List */}
                {!uploading && results.length > 0 && (
                    <Stack space={2} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.map((result, idx) => (
                            <Card
                                key={idx}
                                padding={2}
                                tone={result.success ? 'positive' : 'critical'}
                                border
                            >
                                <Flex justify="space-between" align="center">
                                    <Stack space={1} flex={1}>
                                        <Flex align="center" gap={2}>
                                            {result.success ? (
                                                <CheckCircle2 size={16} style={{ color: '#37b24d' }} />
                                            ) : (
                                                <XCircle size={16} style={{ color: '#f03e3e' }} />
                                            )}
                                            <Text size={1} weight="medium">{result.fileName}</Text>
                                        </Flex>
                                        {result.success ? (
                                            <Flex align="center" gap={2}>
                                                <LinkIcon size={12} style={{ opacity: 0.5 }} />
                                                <Text size={0} muted>→ {result.collegeName}</Text>
                                            </Flex>
                                        ) : (
                                            <Text size={0} style={{ color: '#f03e3e' }}>
                                                {result.error}
                                            </Text>
                                        )}
                                    </Stack>
                                </Flex>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Empty State */}
                {!uploading && results.length === 0 && (
                    <Card padding={4} tone="transparent" style={{ textAlign: 'center' }}>
                        <Stack space={2}>
                            <ImageIcon size={32} style={{ margin: '0 auto', opacity: 0.3 }} />
                            <Text size={1} muted>No uploads yet</Text>
                            <Text size={0} muted>Select images to get started</Text>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Card>
    )
}
