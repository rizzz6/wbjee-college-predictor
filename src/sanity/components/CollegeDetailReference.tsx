import { Stack, Button, useToast, Card, Text, Spinner, Badge } from '@sanity/ui'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useClient, useFormValue, ObjectInputProps } from 'sanity'
import type { PlacementStats, FeeStats, AboutParagraphs, TableRow } from './types'
import { Download, Upload } from 'lucide-react'
import { apiVersion } from '../env'

export default function CollegeDetailReferenceInput(props: ObjectInputProps) {
    const { value, renderDefault } = props
    const client = useClient({ apiVersion })

    const toast = useToast()

    const docId = useFormValue(['_id']) as string
    const lastSyncedAt = useFormValue(['lastSyncedAt']) as string | undefined
    const [loading, setLoading] = useState(false)
    const [pushing, setPushing] = useState(false)
    const [debugData, setDebugData] = useState<unknown>(null)
    const previousRefRef = useRef<string | null>(null)
    const [now, setNow] = useState<number | null>(null)

    useEffect(() => { setNow(Date.now()) }, [])

    const handlePull = useCallback(async () => {
        if (!value?._ref) {
            toast.push({ status: 'warning', title: 'Select a detail record first' })
            return
        }
        if (!docId) {
            toast.push({ status: 'warning', title: 'Save the document first' })
            return
        }

        setLoading(true)
        try {
            // Fetch collegeDetail
            const detailDoc = await client.fetch(`* [_id == $id][0]{
    highlights,
        about,
        location,
        type,
        website,
        seoDescription,
        feesStats,
        placementStats
} `, { id: value._ref })

            if (!detailDoc) {
                throw new Error('Detail record not found')
            }

            // Validation warnings
            if (!detailDoc.highlights || detailDoc.highlights.length === 0) {
                toast.push({
                    status: 'warning',
                    title: 'Incomplete Data',
                    description: 'No highlights found in source record'
                })
            }

            if (!detailDoc.about?.para1) {
                toast.push({
                    status: 'warning',
                    title: 'Missing Content',
                    description: 'No "About" content in source'
                })
            }

            // Transform placements
            const pStats: PlacementStats = detailDoc.placementStats || {}
            const placementRows: TableRow[] = [
                { _key: 'head', cells: ['Metric', 'Value'] }
            ]
            if (pStats.highestPackage) placementRows.push({ _key: 'hp', cells: ['Highest Package', String(pStats.highestPackage)] })
            if (pStats.averagePackage) placementRows.push({ _key: 'ap', cells: ['Average Package', String(pStats.averagePackage)] })
            if (pStats.topRecruiters && Array.isArray(pStats.topRecruiters)) {
                placementRows.push({ _key: 'tr', cells: ['Top Recruiters', pStats.topRecruiters.join(', ')] })
            }

            // Transform fees
            const fees: FeeStats = detailDoc.feesStats || {}
            const feeRows: TableRow[] = [
                { _key: 'head', cells: ['Fee Type', 'Amount'] }
            ]
            if (fees.tuitionFee) feeRows.push({ _key: 'tf', cells: ['Tuition Fee', String(fees.tuitionFee)] })
            if (fees.totalCost) feeRows.push({ _key: 'tc', cells: ['Total Cost', String(fees.totalCost)] })
            if (fees.scholarships) feeRows.push({ _key: 'sc', cells: ['Scholarships', String(fees.scholarships)] })

            // Transform about (object with para1, para2, etc. -> portable text)
            const aboutObj: AboutParagraphs = detailDoc.about || {}
            const aboutBlocks = []
            if (aboutObj.para1) aboutBlocks.push({ _type: 'block', _key: 'p1', style: 'normal', children: [{ _type: 'span', text: aboutObj.para1 }] })
            if (aboutObj.para2) aboutBlocks.push({ _type: 'block', _key: 'p2', style: 'normal', children: [{ _type: 'span', text: aboutObj.para2 }] })
            if (aboutObj.para3) aboutBlocks.push({ _type: 'block', _key: 'p3', style: 'normal', children: [{ _type: 'span', text: aboutObj.para3 }] })
            if (aboutObj.para4) aboutBlocks.push({ _type: 'block', _key: 'p4', style: 'normal', children: [{ _type: 'span', text: aboutObj.para4 }] })

            // Extract establishment year from highlights (e.g., "Estd. 1955")
            const highlights = detailDoc.highlights || []
            const estdHighlight = highlights.find((h: string) => h.toLowerCase().includes('estd'))
            const estYearMatch = estdHighlight?.match(/\d{4}/)
            const estYear = estYearMatch ? parseInt(estYearMatch[0]) : undefined

            // Filter out estd from highlights (it goes to estYear field instead)
            const filteredHighlights = highlights.filter((h: string) => !h.toLowerCase().includes('estd'))

            // Patch college document
            await client.patch(docId).set({
                highlights: filteredHighlights,
                placements: { rows: placementRows },
                feeStructure: { rows: feeRows },
                body: aboutBlocks,
                location: detailDoc.location || undefined,
                type: detailDoc.type === 'Govt' ? 'Government' : detailDoc.type === 'Pvt' ? 'Private' : detailDoc.type,
                website: detailDoc.website || undefined,
                description: detailDoc.seoDescription || undefined,
                estYear: estYear,
                lastSyncedAt: new Date().toISOString(),
            }).commit()

            toast.push({ status: 'success', title: 'Data pulled from source' })
        } catch (e) {
            console.error(e)
            const msg = e instanceof Error ? e.message : String(e)
            toast.push({ status: 'error', title: 'Pull failed', description: msg })
        } finally {
            setLoading(false)
        }
    }, [value, client, docId, toast])

    const handlePush = useCallback(async () => {
        if (!value?._ref) {
            toast.push({ status: 'warning', title: 'Select a detail record first' })
            return
        }
        if (!docId) {
            toast.push({ status: 'warning', title: 'Save the document first' })
            return
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            'This will overwrite the source data in collegeDetail.\n\nAre you sure you want to push these changes?'
        )
        if (!confirmed) return

        setPushing(true)
        try {
            // Fetch current college data
            const collegeDoc = await client.fetch(`* [_id == $id][0]{
    highlights,
        placements,
        feeStructure,
        body,
        location,
        type,
        website,
        description
} `, { id: docId })

            if (!collegeDoc) throw new Error('College document not found')

            // Reverse transform placements
            const placementRows = collegeDoc.placements?.rows || []
            const placementStats: Record<string, unknown> = {}
            placementRows.forEach((row: { cells: string[] }) => {
                if (row.cells && row.cells.length === 2) {
                    const [key, val] = row.cells
                    if (key === 'Highest Package') placementStats.highestPackage = val
                    if (key === 'Average Package') placementStats.averagePackage = val
                    if (key === 'Top Recruiters') placementStats.topRecruiters = val.split(',').map((r: string) => r.trim())
                }
            })

            // Reverse transform fees
            const feeRows = collegeDoc.feeStructure?.rows || []
            const feesStats: Record<string, unknown> = {}
            feeRows.forEach((row: { cells: string[] }) => {
                if (row.cells && row.cells.length === 2) {
                    const [key, val] = row.cells
                    if (key === 'Tuition Fee') feesStats.tuitionFee = val
                    if (key === 'Total Cost') feesStats.totalCost = val
                    if (key === 'Scholarships') feesStats.scholarships = val
                }
            })

            // Reverse transform body (portable text blocks -> about object)
            const bodyBlocks = collegeDoc.body || []
            const aboutObj: Record<string, string> = {}
            bodyBlocks.forEach((block: { children?: { text?: string }[] }, index: number) => {
                const text = block.children?.map((child) => child.text || '').join('') || ''
                if (text) aboutObj[`para${index + 1} `] = text
            })

            // Push to collegeDetail
            await client.patch(value._ref).set({
                highlights: collegeDoc.highlights || [],
                about: aboutObj,
                location: collegeDoc.location || '',
                type: collegeDoc.type === 'Government' ? 'Govt' : collegeDoc.type === 'Private' ? 'Pvt' : collegeDoc.type || '',
                website: collegeDoc.website || '',
                seoDescription: collegeDoc.description || '',
                placementStats: placementStats,
                feesStats: feesStats,
            }).commit()

            toast.push({ status: 'success', title: 'Changes pushed to source' })
        } catch (e) {
            console.error(e)
            const msg = e instanceof Error ? e.message : String(e)
            toast.push({ status: 'error', title: 'Push failed', description: msg })
        } finally {
            setPushing(false)
        }
    }, [value, client, docId, toast])

    // Auto-pull when reference changes
    useEffect(() => {
        const currentRef = value?._ref
        if (currentRef && currentRef !== previousRefRef.current && docId) {
            handlePull()
        }
        previousRefRef.current = currentRef || null
    }, [value?._ref, handlePull, docId])

    return (
        <Stack space={3}>
            {renderDefault(props)}

            {/* Warning when no reference selected */}
            {!value?._ref && docId && (
                <Card padding={3} tone="caution" marginTop={2}>
                    <Text size={1}>No detail source selected. Select one above to populate data.</Text>
                </Card>
            )}

            {value?._ref && (
                <Card padding={3} radius={2} shadow={1} tone="primary">
                    <Stack space={3}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text size={1} weight="semibold">Sync Actions</Text>
                            {lastSyncedAt && now && (() => {
                                const isRecent = (now - new Date(lastSyncedAt).getTime()) < 86400000
                                return (
                                    <Badge tone={isRecent ? 'positive' : 'caution'} fontSize={0}>
                                        {isRecent ? 'Recently Synced' : 'Outdated'}
                                    </Badge>
                                )
                            })()}
                        </div>

                        <Stack space={2}>
                            <Button
                                mode="ghost"
                                text={loading ? 'Pulling...' : 'Pull Data from Source'}
                                tone="primary"
                                onClick={async () => {
                                    await handlePull()
                                    // Store debug data after pull
                                    if (value?._ref) {
                                        const data = await client.fetch(`*[_id == $id][0]`, { id: value._ref })
                                        setDebugData(data)
                                    }
                                }}
                                disabled={loading || pushing}
                                fontSize={1}
                                icon={loading ? Spinner : Download}
                            />
                            <Button
                                mode="ghost"
                                text={pushing ? 'Pushing...' : 'Push Changes to Source'}
                                tone="caution"
                                onClick={handlePush}
                                disabled={loading || pushing}
                                fontSize={1}
                                icon={pushing ? Spinner : Upload}
                            />
                        </Stack>

                        <Text size={0} muted>
                            Pull: Fetch data from Detail | Push: Save your edits back to Detail
                        </Text>

                        {/* Debug Panel */}
                        <details>
                            <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#999' }}>
                                Debug: View Raw Source Data
                            </summary>
                            <Card padding={2} tone="transparent" marginTop={2}>
                                <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '300px', margin: 0 }}>
                                    {debugData ? JSON.stringify(debugData, null, 2) : 'Click "Pull Data" to view source'}
                                </pre>
                            </Card>
                        </details>
                    </Stack>
                </Card>
            )}
        </Stack>
    )
}
