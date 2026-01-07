'use client'

/**
 * Preview pane for college documents in Sanity Studio
 * Uses _rev as cache-buster for automatic updates on edit
 * 
 * How it works:
 * - Every keystroke in Sanity changes the document's _rev (revision ID)
 * - Including _rev in the iframe URL forces a reload on every save
 * - Simple, robust, no complex subscriptions needed!
 */
export function CollegePreviewPane({ document }: { document: { displayed: Record<string, unknown> } }) {
    const { displayed } = document

    if (!displayed._id || typeof displayed._id !== 'string') {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#666',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div>
                    <p style={{ fontSize: '18px', marginBottom: '8px' }}>Preview not available</p>
                    <p style={{ fontSize: '14px' }}>Please save the document first to enable preview</p>
                </div>
            </div>
        )
    }

    const docId = displayed._id as string
    const docRev = typeof displayed._rev === 'string' ? displayed._rev : 'unknown'
    // _rev changes on every edit -> URL changes -> Iframe reloads
    // This is the "lazy developer trick" - letting the browser do the work!
    const previewUrl = `/preview/college/${docId}?rev=${docRev}`

    return (
        <div style={{ height: '100%', position: 'relative' }}>
            {/* Loading indicator overlay */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000,
                pointerEvents: 'none'
            }}>
                Rev: {docRev.substring(0, 8)}...
            </div>

            <iframe
                key={docRev} // Force remount on revision change
                src={previewUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#fff'
                }}
                title="College Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
            />
        </div>
    )
}
