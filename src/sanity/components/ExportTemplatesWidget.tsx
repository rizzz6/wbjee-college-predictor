// Export Templates Widget
// Create and manage custom export templates

'use client'

import { Stack, Text, Button, Box, Badge, Flex, TextInput, Select, Checkbox, Grid } from '@sanity/ui'
import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'
import { Download, Plus, Trash2, Save, FileSpreadsheet } from 'lucide-react'
import { apiVersion } from '../env'
import {
    exportWithTemplate,
    saveTemplate,
    loadTemplates,
    deleteTemplate,
    AVAILABLE_FIELDS,
    type ExportTemplate
} from '../utils/exportTemplates'
import { WidgetCard } from './shared'

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

    const loadSavedTemplates = useCallback(() => {
        const saved = loadTemplates()
        setTemplates(saved)
        if (selectedFields.length === 0) {
            setSelectedFields(AVAILABLE_FIELDS.filter(f => f.selected).map(f => f.key))
        }
    }, [selectedFields.length])

    useEffect(() => { loadSavedTemplates() }, [loadSavedTemplates])

    const handleCreateTemplate = () => {
        if (!newTemplateName.trim()) return
        const template: ExportTemplate = { name: newTemplateName.trim(), fields: selectedFields, format: exportFormat }
        saveTemplate(template)
        loadSavedTemplates()
        setNewTemplateName('')
        setCreating(false)
    }

    const handleDeleteTemplate = (templateName: string) => {
        if (window.confirm(`Delete template "${templateName}"?`)) {
            deleteTemplate(templateName)
            loadSavedTemplates()
            if (selectedTemplate === templateName) setSelectedTemplate('')
        }
    }

    const handleLoadTemplate = (templateName: string) => {
        const template = templates.find(t => t.name === templateName)
        if (template) {
            setSelectedFields(template.fields)
            if (template.format === 'json' || template.format === 'csv') setExportFormat(template.format)
            setSelectedTemplate(templateName)
        }
    }

    const handleExport = async () => {
        if (selectedFields.length === 0) return alert('Select at least one field')
        setExporting(true)
        try {
            const template: ExportTemplate = { name: selectedTemplate || 'custom-export', fields: selectedFields, format: exportFormat }
            const result = await exportWithTemplate(client, template, filter)
            alert(result.success ? result.message : `Export failed: ${result.message}`)
        } catch (error) {
            alert('Export failed')
            console.error(error)
        } finally {
            setExporting(false)
        }
    }

    const toggleField = (fieldKey: string) => {
        setSelectedFields(prev => prev.includes(fieldKey) ? prev.filter(k => k !== fieldKey) : [...prev, fieldKey])
    }

    return (
        <WidgetCard
            title="Export Templates"
            icon={<FileSpreadsheet size={18} />}
            iconColor="#3b82f6"
            headerGradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            collapsible
        >
            <Stack space={4}>
                {/* Saved Templates */}
                {templates.length > 0 && (
                    <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Text size={0} weight="semibold" muted>SAVED TEMPLATES</Text>
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
                                            <Badge tone="primary" fontSize={0}>{template.format.toUpperCase()}</Badge>
                                            <Badge tone="default" fontSize={0}>{template.fields.length} fields</Badge>
                                            <Button icon={Trash2} mode="bleed" tone="critical" onClick={() => handleDeleteTemplate(template.name)} fontSize={0} />
                                        </Flex>
                                    </Flex>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                )}

                {/* Field Selection */}
                <Box padding={3} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <Stack space={2}>
                        <Text size={0} weight="semibold" muted>SELECT FIELDS</Text>
                        <Box style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <Stack space={1}>
                                {AVAILABLE_FIELDS.map(field => (
                                    <Flex key={field.key} align="center" gap={2}>
                                        <Checkbox checked={selectedFields.includes(field.key)} onChange={() => toggleField(field.key)} />
                                        <Text size={1}>{field.label}</Text>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                        <Text size={0} muted>{selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected</Text>
                    </Stack>
                </Box>

                {/* Export Options */}
                <Grid columns={2} gap={2}>
                    <Stack space={1}>
                        <Text size={0} muted>FORMAT</Text>
                        <Select value={exportFormat} onChange={(e) => setExportFormat(e.currentTarget.value as 'json' | 'csv')} fontSize={1}>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </Select>
                    </Stack>
                    <Stack space={1}>
                        <Text size={0} muted>FILTER</Text>
                        <Select value={filter} onChange={(e) => setFilter(e.currentTarget.value as 'all' | 'visible' | 'hidden')} fontSize={1}>
                            <option value="all">All</option>
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                        </Select>
                    </Stack>
                </Grid>

                {/* Actions */}
                <Flex gap={2}>
                    <Button
                        text={exporting ? 'Exporting...' : 'Export'}
                        onClick={handleExport}
                        disabled={exporting || selectedFields.length === 0}
                        tone="positive"
                        icon={Download}
                        fontSize={1}
                        style={{ flex: 1 }}
                    />
                    <Button text="Save Template" onClick={() => setCreating(true)} mode="ghost" icon={Plus} fontSize={1} />
                </Flex>

                {/* Create Template */}
                {creating && (
                    <Box padding={3} style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                        <Stack space={2}>
                            <Text size={0} weight="semibold" muted>SAVE TEMPLATE</Text>
                            <TextInput placeholder="Template name..." value={newTemplateName} onChange={(e) => setNewTemplateName(e.currentTarget.value)} fontSize={1} />
                            <Flex gap={2}>
                                <Button text="Save" onClick={handleCreateTemplate} disabled={!newTemplateName.trim()} tone="positive" icon={Save} fontSize={1} />
                                <Button text="Cancel" onClick={() => { setCreating(false); setNewTemplateName('') }} mode="ghost" fontSize={1} />
                            </Flex>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </WidgetCard>
    )
}
