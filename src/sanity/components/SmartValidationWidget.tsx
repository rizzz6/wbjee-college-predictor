// Smart Validation Widget
// Provides intelligent validation with auto-fix suggestions

'use client'

import { Card, Stack, Text, Button, Box, Badge, Spinner, Flex } from '@sanity/ui'
import { useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { CheckCircle2, AlertTriangle, Info, Wand2, RefreshCw } from 'lucide-react'
import { apiVersion } from '../env'
import { validateColleges, autoFixIssues, type ValidationResult } from '../utils/smartValidation'

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
            // Show only colleges with issues
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

            if (fixResult.fixed > 0) {
                // Re-validate to update results
                await handleValidate()
            }
        } catch (error) {
            console.error('Auto-fix failed:', error)
        } finally {
            setFixing(prev => {
                const next = new Set(prev)
                next.delete(result.collegeId)
                return next
            })
        }
    }

    const navigateToCollege = (id: string) => {
        router.navigateUrl({ path: `/desk/college;${id}` })
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return <AlertTriangle size={14} style={{ color: '#f03e3e' }} />
            case 'warning': return <AlertTriangle size={14} style={{ color: '#f59f00' }} />
            case 'info': return <Info size={14} style={{ color: '#228be6' }} />
            default: return null
        }
    }

    const getSeverityTone = (severity: string): 'critical' | 'caution' | 'primary' => {
        switch (severity) {
            case 'error': return 'critical'
            case 'warning': return 'caution'
            default: return 'primary'
        }
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Stack space={1}>
                        <Text size={2} weight="bold">Smart Validation</Text>
                        <Text size={0} muted>Intelligent data quality checks with auto-fix</Text>
                    </Stack>
                    <Button
                        text={validating ? 'Validating...' : 'Validate All'}
                        onClick={handleValidate}
                        disabled={validating}
                        icon={validating ? undefined : RefreshCw}
                        tone="primary"
                        fontSize={1}
                    />
                </Flex>

                {/* Loading State */}
                {validating && (
                    <Card padding={3} tone="transparent">
                        <Stack space={2} style={{ alignItems: 'center' }}>
                            <Spinner />
                            <Text size={1} muted>Analyzing college data...</Text>
                        </Stack>
                    </Card>
                )}

                {/* Results Summary */}
                {!validating && results.length > 0 && (
                    <Card padding={3} tone="transparent" border>
                        <Flex justify="space-between" align="center">
                            <Text size={1} weight="semibold">
                                Found {results.length} college{results.length !== 1 ? 's' : ''} with issues
                            </Text>
                            <Flex gap={2}>
                                <Badge tone="critical">
                                    {results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'error').length, 0)} Errors
                                </Badge>
                                <Badge tone="caution">
                                    {results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0)} Warnings
                                </Badge>
                            </Flex>
                        </Flex>
                    </Card>
                )}

                {/* No Issues */}
                {!validating && results.length === 0 && (
                    <Card padding={4} tone="positive" style={{ textAlign: 'center' }}>
                        <Stack space={2}>
                            <CheckCircle2 size={32} style={{ margin: '0 auto', color: '#37b24d' }} />
                            <Text size={1} weight="semibold">All colleges validated successfully!</Text>
                            <Text size={0} muted>No issues found</Text>
                        </Stack>
                    </Card>
                )}

                {/* Results List */}
                {!validating && results.length > 0 && (
                    <Stack space={2} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.map(result => {
                            const autoFixableCount = result.issues.filter(i => i.autoFixable).length
                            const isFixing = fixing.has(result.collegeId)

                            return (
                                <Card key={result.collegeId} padding={3} border>
                                    <Stack space={3}>
                                        {/* College Header */}
                                        <Flex justify="space-between" align="center">
                                            <Stack space={1}>
                                                <Text size={1} weight="semibold">{result.collegeName}</Text>
                                                <Flex gap={2} align="center">
                                                    <Badge tone={result.score >= 80 ? 'positive' : result.score >= 50 ? 'caution' : 'critical'}>
                                                        Score: {result.score}/100
                                                    </Badge>
                                                    <Text size={0} muted>
                                                        {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''}
                                                    </Text>
                                                </Flex>
                                            </Stack>
                                            <Flex gap={2}>
                                                {autoFixableCount > 0 && (
                                                    <Button
                                                        text={isFixing ? 'Fixing...' : `Auto-Fix (${autoFixableCount})`}
                                                        onClick={() => handleAutoFix(result)}
                                                        disabled={isFixing}
                                                        icon={Wand2}
                                                        mode="ghost"
                                                        tone="positive"
                                                        fontSize={0}
                                                    />
                                                )}
                                                <Button
                                                    text="Edit"
                                                    onClick={() => navigateToCollege(result.collegeId)}
                                                    mode="ghost"
                                                    fontSize={0}
                                                />
                                            </Flex>
                                        </Flex>

                                        {/* Issues List */}
                                        <Stack space={1}>
                                            {result.issues.map((issue, idx) => (
                                                <Card key={idx} padding={2} tone={getSeverityTone(issue.severity)}>
                                                    <Flex gap={2} align="flex-start">
                                                        {getSeverityIcon(issue.severity)}
                                                        <Stack space={1} flex={1}>
                                                            <Text size={0} weight="medium">
                                                                {issue.field}: {issue.message}
                                                            </Text>
                                                            {issue.suggestedFix !== undefined && (
                                                                <Text size={0} muted>
                                                                    Suggested: "{String(issue.suggestedFix)}"
                                                                    {issue.autoFixable && ' (auto-fixable)'}
                                                                </Text>
                                                            )}
                                                        </Stack>
                                                    </Flex>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </Card>
                            )
                        })}
                    </Stack>
                )}
            </Stack>
        </Card>
    )
}
