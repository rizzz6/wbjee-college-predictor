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
export function CollegePreviewPane({ document }: { document: any }) {
    const { displayed } = document

    if (!displayed._id) {
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

    // _rev changes on every edit -> URL changes -> Iframe reloads
    // This is the "lazy developer trick" - letting the browser do the work!
    const previewUrl = `/preview/college/${displayed._id}?rev=${displayed._rev}`

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
                Rev: {displayed._rev?.substring(0, 8)}...
            </div>

            <iframe
                key={displayed._rev} // Force remount on revision change
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
