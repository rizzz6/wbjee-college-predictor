'use client'

import { useState, useCallback } from 'react'
import { useClient } from 'sanity'
import { useToast } from '@sanity/ui'
import { apiVersion } from '../../env'
import {
    exportColleges,
    deleteAllColleges,
    importCollegesFromJSON,
    importCollegesFromCSV,
    publishAllDrafts,
    validateAllColleges,
    rebuildAllData,
    type ValidationIssue
} from '../dataActions'

/**
 * Custom hook that wraps data actions with loading states and toast notifications
 */
export function useSanityActions() {
    const client = useClient({ apiVersion })
    const toast = useToast()

    const [exporting, setExporting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [importing, setImporting] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [validating, setValidating] = useState(false)
    const [rebuilding, setRebuilding] = useState(false)
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])

    const handleExport = useCallback(async (format: 'json' | 'csv') => {
        setExporting(true)
        try {
            const result = await exportColleges(client, format)

            if (result.success) {
                toast.push({
                    status: 'success',
                    title: 'Export Complete',
                    description: result.message
                })
            } else {
                toast.push({
                    status: 'error',
                    title: 'Export Failed',
                    description: result.message
                })
            }

            return result
        } finally {
            setExporting(false)
        }
    }, [client, toast])

    const handleDelete = useCallback(async () => {
        const confirmed = window.confirm(
            '⚠️ This will DELETE ALL college documents permanently.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?'
        )

        if (!confirmed) return { success: false, message: 'Cancelled by user' }

        setDeleting(true)
        try {
            const result = await deleteAllColleges(client)

            if (result.success) {
                toast.push({
                    status: 'success',
                    title: 'Delete Complete',
                    description: result.message
                })
            } else {
                toast.push({
                    status: 'error',
                    title: 'Delete Failed',
                    description: result.message
                })
            }

            return result
        } finally {
            setDeleting(false)
        }
    }, [client, toast])

    const handleImport = useCallback(async (format: 'json' | 'csv' = 'json') => {
        return new Promise((resolve) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = format === 'csv' ? '.csv' : '.json'

            input.onchange = async (e: any) => {
                const file = e.target?.files?.[0]
                if (!file) {
                    resolve({ success: false, message: 'No file selected' })
                    return
                }

                setImporting(true)
                try {
                    const result = format === 'csv'
                        ? await importCollegesFromCSV(client, file)
                        : await importCollegesFromJSON(client, file)

                    if (result.success) {
                        toast.push({
                            status: 'success',
                            title: 'Import Complete',
                            description: result.message
                        })
                    } else {
                        toast.push({
                            status: 'error',
                            title: 'Import Failed',
                            description: result.message
                        })
                    }

                    resolve(result)
                } finally {
                    setImporting(false)
                }
            }

            input.click()
        })
    }, [client, toast])

    const handlePublish = useCallback(async () => {
        setPublishing(true)
        try {
            const result = await publishAllDrafts(client)

            if (result.success) {
                toast.push({
                    status: 'success',
                    title: 'Publish Complete',
                    description: result.message
                })
            } else {
                toast.push({
                    status: 'warning',
                    title: 'Publish Status',
                    description: result.message
                })
            }

            return result
        } finally {
            setPublishing(false)
        }
    }, [client, toast])

    const handleValidate = useCallback(async () => {
        setValidating(true)
        try {
            const result = await validateAllColleges(client)

            setValidationIssues(result.issues)

            if (result.success) {
                const tone = result.issues.length === 0 ? 'positive' : 'caution'
                toast.push({
                    status: tone === 'positive' ? 'success' : 'warning',
                    title: 'Validation Complete',
                    description: result.message
                })
            } else {
                toast.push({
                    status: 'error',
                    title: 'Validation Failed',
                    description: result.message
                })
            }

            return result
        } finally {
            setValidating(false)
        }
    }, [client, toast])

    const handleRebuild = useCallback(async (collections: string[] = ['college', 'post']) => {
        const confirmed = window.confirm(
            '🔄 This will rebuild all static pages and revalidate cache.\n\nThis may take a few minutes.\n\nContinue?'
        )

        if (!confirmed) return { success: false, message: 'Cancelled by user' }

        setRebuilding(true)
        try {
            const result = await rebuildAllData(collections)

            if (result.success) {
                toast.push({
                    status: 'success',
                    title: 'Rebuild Started',
                    description: result.message
                })
            } else {
                toast.push({
                    status: 'error',
                    title: 'Rebuild Failed',
                    description: result.message
                })
            }

            return result
        } finally {
            setRebuilding(false)
        }
    }, [toast])

    return {
        // Action handlers
        handleExport,
        handleDelete,
        handleImport,
        handlePublish,
        handleValidate,
        handleRebuild,

        // Loading states
        exporting,
        deleting,
        importing,
        publishing,
        validating,
        rebuilding,

        // Validation data
        validationIssues,
        clearValidationIssues: () => setValidationIssues([])
    }
}
