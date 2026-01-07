// Smart Validation Widget
// Provides intelligent validation with auto-fix suggestions

'use client'

import { Stack, Text, Button, Box, Badge, Flex, Card } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { CheckCircle2, AlertTriangle, Info, Wand2, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { validateColleges, autoFixIssues, type ValidationResult } from '../utils/smartValidation'
import { WidgetCard } from './shared'

export function SmartValidationWidget() {
    const client = useClient({ apiVersion })
    const router = useRouter()
    const [validating, setValidating] = useState(false)
    const [results, setResults] = useState<ValidationResult[]>([])
    const [fixing, setFixing] = useState<Set<string>>(new Set())

    const handleValidate = async () => {
        setValidating(true)
        try {
            const validationResults = await validateColleges(client)
            const withIssues = validationResults.filter(r => r.issues.length > 0)
            setResults(withIssues.sort((a, b) => a.score - b.score))
        } catch (error) {
            console.error('Validation failed:', error)
        } finally {
            setValidating(false)
        }
    }

    const handleAutoFix = async (result: ValidationResult) => {
        setFixing(prev => new Set(prev).add(result.collegeId))
        try {
            const fixResult = await autoFixIssues(client, result.collegeId, result.issues)
            if (fixResult.fixed > 0) await handleValidate()
        } catch (error) {
            console.error('Auto-fix failed:', error)
        } finally {
            setFixing(prev => { const next = new Set(prev); next.delete(result.collegeId); return next })
        }
    }

    const navigateToCollege = (id: string) => router.navigateIntent('edit', { id: id?.replace('drafts.', ''), type: 'college' })

    const getSeverityIcon = (severity: string) => {
        if (severity === 'error') return <AlertTriangle size={12} style={{ color: '#ef4444' }} />
        if (severity === 'warning') return <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
        return <Info size={12} style={{ color: '#3b82f6' }} />
    }



    const errorCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'error').length, 0)
    const warningCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0)

    return (
        <WidgetCard
            title="Smart Validation"
            icon={<CheckCircle2 size={18} />}
            iconColor="#f59e0b"
            headerGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            loading={validating}
            collapsible
            actions={
                <Button
                    icon={RefreshCw}
                    onClick={handleValidate}
                    disabled={validating}
                    mode="bleed"
                    style={{ color: 'white' }}
                    title="Validate"
                />
            }
        >
            <Stack space={4}>
                {/* Results Summary */}
                {results.length > 0 && (
                    <Flex gap={2} wrap="wrap">
                        <Badge tone="default">{results.length} with issues</Badge>
                        <Badge tone="critical">{errorCount} errors</Badge>
                        <Badge tone="caution">{warningCount} warnings</Badge>
                    </Flex>
                )}

                {/* No Issues */}
                {!validating && results.length === 0 && (
                    <Box padding={4} style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                        <Stack space={2}>
                            <CheckCircle2 size={28} style={{ margin: '0 auto', color: '#10b981' }} />
                            <Text size={1} weight="semibold" style={{ color: '#10b981' }}>All validated!</Text>
                            <Text size={0} muted>No issues found</Text>
                        </Stack>
                    </Box>
                )}

                {/* Results List */}
                {results.length > 0 && (
                    <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Stack space={2}>
                            {results.map(result => {
                                const autoFixableCount = result.issues.filter(i => i.autoFixable).length
                                const isFixing = fixing.has(result.collegeId)

                                return (
                                    <Card key={result.collegeId} padding={3} border radius={2}>
                                        <Stack space={2}>
                                            <Flex justify="space-between" align="center">
                                                <Stack space={1}>
                                                    <Text size={1} weight="semibold">{result.collegeName}</Text>
                                                    <Flex gap={2} align="center">
                                                        <Badge tone={result.score >= 80 ? 'positive' : result.score >= 50 ? 'caution' : 'critical'}>
                                                            {result.score}/100
                                                        </Badge>
                                                        <Text size={0} muted>{result.issues.length} issues</Text>
                                                    </Flex>
                                                </Stack>
                                                <Flex gap={1}>
                                                    {autoFixableCount > 0 && (
                                                        <Button
                                                            text={isFixing ? '...' : `Fix ${autoFixableCount}`}
                                                            onClick={() => handleAutoFix(result)}
                                                            disabled={isFixing}
                                                            icon={Wand2}
                                                            mode="ghost"
                                                            tone="positive"
                                                            fontSize={0}
                                                        />
                                                    )}
                                                    <Button text="Edit" onClick={() => navigateToCollege(result.collegeId)} mode="ghost" fontSize={0} />
                                                </Flex>
                                            </Flex>
                                            <Stack space={1}>
                                                {result.issues.slice(0, 3).map((issue, idx) => (
                                                    <Flex key={idx} gap={2} align="center">
                                                        {getSeverityIcon(issue.severity)}
                                                        <Text size={0} muted>{issue.field}: {issue.message}</Text>
                                                    </Flex>
                                                ))}
                                                {result.issues.length > 3 && <Text size={0} muted>+{result.issues.length - 3} more</Text>}
                                            </Stack>
                                        </Stack>
                                    </Card>
                                )
                            })}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
