// Export Templates Widget
// Create and manage custom export templates

'use client'

import { Card, Stack, Text, Button, Box, Badge, Flex, TextInput, Select, Checkbox, Grid } from '@sanity/ui'
import { useState, useEffect } from 'react'
import { useClient } from 'sanity'
import { Download, Plus, Trash2, Save } from 'lucide-react'
import { apiVersion } from '../env'
import {
    exportWithTemplate,
    saveTemplate,
    loadTemplates,
    deleteTemplate,
    AVAILABLE_FIELDS,
    type ExportTemplate
} from '../utils/exportTemplates'

export function ExportTemplatesWidget() {
    const client = useClient({ apiVersion })
    const [templates, setTemplates] = useState<ExportTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [newTemplateName, setNewTemplateName] = useState('')
    const [selectedFields, setSelectedFields] = useState<string[]>([])
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv')
    const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
    const [exporting, setExporting] = useState(false)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadSavedTemplates()
    }, [])

    const loadSavedTemplates = () => {
        const saved = loadTemplates()
        setTemplates(saved)

        // Set default selected fields
        if (selectedFields.length === 0) {
            setSelectedFields(AVAILABLE_FIELDS.filter(f => f.selected).map(f => f.key))
        }
    }

    const handleCreateTemplate = () => {
        if (!newTemplateName.trim()) return

        const template: ExportTemplate = {
            name: newTemplateName.trim(),
            fields: selectedFields,
            format: exportFormat
        }

        saveTemplate(template)
        loadSavedTemplates()
        setNewTemplateName('')
        setCreating(false)
    }

    const handleDeleteTemplate = (templateName: string) => {
        if (window.confirm(`Delete template "${templateName}"?`)) {
            deleteTemplate(templateName)
            loadSavedTemplates()
            if (selectedTemplate === templateName) {
                setSelectedTemplate('')
            }
        }
    }

    const handleLoadTemplate = (templateName: string) => {
        const template = templates.find(t => t.name === templateName)
        if (template) {
            setSelectedFields(template.fields)
            // Only set format if it's supported
            if (template.format === 'json' || template.format === 'csv') {
                setExportFormat(template.format)
            }
            setSelectedTemplate(templateName)
        }
    }

    const handleExport = async () => {
        if (selectedFields.length === 0) {
            alert('Please select at least one field to export')
            return
        }

        setExporting(true)
        try {
            const template: ExportTemplate = {
                name: selectedTemplate || 'custom-export',
                fields: selectedFields,
                format: exportFormat
            }

            const result = await exportWithTemplate(client, template, filter)

            if (result.success) {
                alert(result.message)
            } else {
                alert(`Export failed: ${result.message}`)
            }
        } catch (error) {
            alert('Export failed. See console for details.')
            console.error(error)
        } finally {
            setExporting(false)
        }
    }

    const toggleField = (fieldKey: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldKey)
                ? prev.filter(k => k !== fieldKey)
                : [...prev, fieldKey]
        )
    }

    return (
        <Card padding={4}>
            <Stack space={4}>
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Stack space={1}>
                        <Text size={2} weight="bold">Export Templates</Text>
                        <Text size={0} muted>Create custom export formats</Text>
                    </Stack>
                    <Download size={20} style={{ opacity: 0.5 }} />
                </Flex>

                {/* Saved Templates */}
                {templates.length > 0 && (
                    <Card padding={3} tone="transparent" border>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">Saved Templates</Text>
                            <Stack space={1}>
                                {templates.map(template => (
                                    <Flex key={template.name} justify="space-between" align="center">
                                        <Button
                                            text={template.name}
                                            mode={selectedTemplate === template.name ? 'default' : 'ghost'}
                                            onClick={() => handleLoadTemplate(template.name)}
                                            fontSize={1}
                                            style={{ flex: 1, justifyContent: 'flex-start' }}
                                        />
                                        <Flex gap={1}>
                                            <Badge tone="primary" fontSize={0}>
                                                {template.format.toUpperCase()}
                                            </Badge>
                                            <Badge tone="default" fontSize={0}>
                                                {template.fields.length} fields
                                            </Badge>
                                            <Button
                                                icon={Trash2}
                                                mode="bleed"
                                                tone="critical"
                                                onClick={() => handleDeleteTemplate(template.name)}
                                                fontSize={0}
                                            />
                                        </Flex>
                                    </Flex>
                                ))}
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* Field Selection */}
                <Card padding={3} tone="transparent" border>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">Select Fields to Export</Text>
                        <Box style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <Stack space={1}>
                                {AVAILABLE_FIELDS.map(field => (
                                    <Flex key={field.key} align="center" gap={2}>
                                        <Checkbox
                                            checked={selectedFields.includes(field.key)}
                                            onChange={() => toggleField(field.key)}
                                        />
                                        <Text size={1}>{field.label}</Text>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                        <Text size={0} muted>
                            {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                        </Text>
                    </Stack>
                </Card>

                {/* Export Options */}
                <Grid columns={2} gap={2}>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">Format</Text>
                        <Select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.currentTarget.value as 'json' | 'csv')}
                            fontSize={1}
                        >
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </Select>
                    </Stack>

                    <Stack space={2}>
                        <Text size={1} weight="semibold">Filter</Text>
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.currentTarget.value as any)}
                            fontSize={1}
                        >
                            <option value="all">All Colleges</option>
                            <option value="visible">Visible Only</option>
                            <option value="hidden">Hidden Only</option>
                        </Select>
                    </Stack>
                </Grid>

                {/* Actions */}
                <Flex gap={2}>
                    <Button
                        text={exporting ? 'Exporting...' : 'Export Now'}
                        onClick={handleExport}
                        disabled={exporting || selectedFields.length === 0}
                        tone="positive"
                        icon={Download}
                        fontSize={1}
                        style={{ flex: 1 }}
                    />
                    <Button
                        text="Save as Template"
                        onClick={() => setCreating(true)}
                        mode="ghost"
                        icon={Plus}
                        fontSize={1}
                    />
                </Flex>

                {/* Create Template Dialog */}
                {creating && (
                    <Card padding={3} tone="primary" border>
                        <Stack space={2}>
                            <Text size={1} weight="semibold">Save Template</Text>
                            <TextInput
                                placeholder="Template name (e.g., 'Basic Info')"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.currentTarget.value)}
                                fontSize={1}
                            />
                            <Flex gap={2}>
                                <Button
                                    text="Save"
                                    onClick={handleCreateTemplate}
                                    disabled={!newTemplateName.trim()}
                                    tone="positive"
                                    icon={Save}
                                    fontSize={1}
                                />
                                <Button
                                    text="Cancel"
                                    onClick={() => {
                                        setCreating(false)
                                        setNewTemplateName('')
                                    }}
                                    mode="ghost"
                                    fontSize={1}
                                />
                            </Flex>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Card>
    )
}
