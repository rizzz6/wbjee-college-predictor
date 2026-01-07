// Broken Link Checker Widget
// Validates all URLs in college data

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Select, Card } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { useToast } from '@sanity/ui'
import { Link, ExternalLink, CheckCircle, XCircle, AlertTriangle, RefreshCw, Globe } from 'lucide-react'
import { apiVersion } from '../env'
import { WidgetCard, ProgressBar, EmptyState } from './shared'

interface LinkCheckResult {
    collegeId: string
    collegeName: string
    url: string
    field: string
    status: 'valid' | 'invalid' | 'warning' | 'unchecked'
    error?: string
}

interface LinkStats {
    total: number
    valid: number
    invalid: number
    warning: number
}

export function BrokenLinkCheckerWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const toast = useToast()
    const [results, setResults] = useState<LinkCheckResult[]>([])
    const [stats, setStats] = useState<LinkStats>({ total: 0, valid: 0, invalid: 0, warning: 0 })
    const [checking, setChecking] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [filter, setFilter] = useState<'all' | 'invalid' | 'warning'>('all')

    const extractUrls = async (): Promise<LinkCheckResult[]> => {
        const colleges = await client.fetch<{ _id: string; name: string; website?: string }[]>(
            `*[_type == "college" && defined(website)] { _id, name, website }`
        )
        return colleges
            .filter((college): college is { _id: string; name: string; website: string } =>
                college.website !== undefined && college.website !== null && college.website !== ''
            )
            .map((college) => ({
                collegeId: college._id,
                collegeName: college.name,
                url: college.website,
                field: 'website',
                status: 'unchecked' as const
            }))
    }

    const validateUrl = (url: string): { valid: boolean; warning?: string } => {
        try {
            new URL(url)
            if (!url.startsWith('https://')) return { valid: true, warning: 'Not using HTTPS' }
            if (url.includes(' ')) return { valid: false }
            return { valid: true }
        } catch {
            return { valid: false }
        }
    }

    const checkLinks = async () => {
        setChecking(true)
        setResults([])
        try {
            const urls = await extractUrls()
            setProgress({ current: 0, total: urls.length })

            const checkedResults: LinkCheckResult[] = urls.map((urlResult, i) => {
                setProgress({ current: i + 1, total: urls.length })
                const validation = validateUrl(urlResult.url)
                if (!validation.valid) return { ...urlResult, status: 'invalid' as const, error: 'Invalid URL' }
                if (validation.warning) return { ...urlResult, status: 'warning' as const, error: validation.warning }
                return { ...urlResult, status: 'valid' as const }
            })

            setResults(checkedResults)
            setStats({
                total: checkedResults.length,
                valid: checkedResults.filter(r => r.status === 'valid').length,
                invalid: checkedResults.filter(r => r.status === 'invalid').length,
                warning: checkedResults.filter(r => r.status === 'warning').length
            })
        } catch (error) {
            console.error('Link check failed:', error)
        } finally {
            setChecking(false)
        }
    }

    const navigateToCollege = (id: string) => router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type: 'college' })

    const autoFixHttps = async () => {
        const httpLinks = results.filter(r => r.status === 'warning' && r.url.startsWith('http://'))
        if (httpLinks.length === 0) {
            toast.push({ status: 'warning', title: 'No HTTP links to fix' })
            return
        }

        toast.push({
            status: 'info',
            title: `Update ${httpLinks.length} URL${httpLinks.length > 1 ? 's' : ''} to HTTPS?`,
            description: 'This will convert all HTTP links to HTTPS',
            duration: 5000
        })

        // Give user time to read, then proceed
        setTimeout(async () => {
            try {
                for (const link of httpLinks) {
                    await client.patch(link.collegeId).set({ website: link.url.replace('http://', 'https://') }).commit()
                }
                toast.push({ status: 'success', title: `✓ Updated ${httpLinks.length} URLs to HTTPS` })
                checkLinks()
            } catch (error) {
                console.error('Failed to update URLs:', error)
                toast.push({ status: 'error', title: 'Failed to update some URLs' })
            }
        }, 3000)
    }

    const filteredResults = results.filter(r => {
        if (filter === 'invalid') return r.status === 'invalid'
        if (filter === 'warning') return r.status === 'warning'
        return true
    })

    const getStatusIcon = (status: string) => {
        if (status === 'valid') return <CheckCircle size={14} style={{ color: '#10b981' }} />
        if (status === 'invalid') return <XCircle size={14} style={{ color: '#ef4444' }} />
        if (status === 'warning') return <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
        return null
    }

    return (
        <WidgetCard
            title="Link Checker"
            icon={<Link size={18} />}
            iconColor="#3b82f6"
            headerGradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            collapsible
            actions={
                <Button
                    icon={RefreshCw}
                    onClick={checkLinks}
                    disabled={checking}
                    mode="bleed"
                    style={{ color: 'white' }}
                    title="Check Links"
                />
            }
        >
            <Stack space={4}>
                {/* Progress */}
                {checking && (
                    <ProgressBar value={progress.current} max={progress.total} color="#3b82f6" />
                )}

                {/* Stats */}
                {results.length > 0 && (
                    <Flex gap={2} wrap="wrap">
                        <Badge tone="default"><Globe size={12} /> {stats.total} URLs</Badge>
                        <Badge tone="positive"><CheckCircle size={12} /> {stats.valid}</Badge>
                        {stats.warning > 0 && <Badge tone="caution"><AlertTriangle size={12} /> {stats.warning}</Badge>}
                        {stats.invalid > 0 && <Badge tone="critical"><XCircle size={12} /> {stats.invalid}</Badge>}
                    </Flex>
                )}

                {/* Filters */}
                {results.length > 0 && (
                    <Flex gap={2}>
                        <Box flex={1}>
                            <Select value={filter} onChange={(e) => setFilter(e.currentTarget.value as 'all' | 'invalid' | 'warning')} fontSize={1}>
                                <option value="all">All ({results.length})</option>
                                <option value="invalid">Invalid ({stats.invalid})</option>
                                <option value="warning">Warnings ({stats.warning})</option>
                            </Select>
                        </Box>
                        {stats.warning > 0 && (
                            <Button text="Fix HTTP" onClick={autoFixHttps} mode="ghost" tone="caution" fontSize={1} />
                        )}
                    </Flex>
                )}

                {/* Results */}
                {results.length > 0 ? (
                    <Box style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <Stack space={2}>
                            {filteredResults.map((result, idx) => (
                                <Card
                                    key={`${result.collegeId}-${idx}`}
                                    padding={2}
                                    tone={result.status === 'invalid' ? 'critical' : result.status === 'warning' ? 'caution' : 'transparent'}
                                    border
                                    radius={2}
                                >
                                    <Flex justify="space-between" align="flex-start" gap={3}>
                                        <Stack space={1} flex={1} style={{ minWidth: 0, overflow: 'visible' }}>
                                            <Flex align="center" gap={2}>
                                                {getStatusIcon(result.status)}
                                                <Text size={1} weight="medium">{result.collegeName}</Text>
                                            </Flex>
                                            <Box paddingLeft={3}>
                                                <Flex align="center" gap={2}>
                                                    <ExternalLink size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                                                    <Text size={0} muted style={{ wordBreak: 'break-all' }}>
                                                        {result.url}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                            {result.error && (
                                                <Box paddingLeft={3}>
                                                    <Text size={0} style={{ color: result.status === 'invalid' ? '#ef4444' : '#f59e0b' }}>
                                                        {result.error}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Stack>
                                        <Button text="Edit" mode="ghost" onClick={() => navigateToCollege(result.collegeId)} fontSize={0} style={{ flexShrink: 0 }} />
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                ) : !checking && (
                    <EmptyState icon={<Globe size={32} />} title="No links checked" description="Click 'Check' to validate URLs" />
                )}
            </Stack>
        </WidgetCard>
    )
}
