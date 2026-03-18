'use client'
import React, { useState } from 'react'
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Database
} from 'lucide-react'

import SyncDashboard from './SyncDashboard'

const collections = [
  { slug: 'colleges', label: 'Colleges' },
  { slug: 'college_cutoffs', label: 'College Cutoffs' },
  { slug: 'posts', label: 'Blog Posts' },
  { slug: 'timeline', label: 'Timeline Events' },
  { slug: 'media', label: 'Media' },
]

export default function DataManagementClient() {
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [revalidatePath, setRevalidatePath] = useState('')

  const handleExport = async (slug: string) => {
    setLoading(`export-${slug}`)
    try {
      const resp = await fetch(`/api/admin/export?collection=${slug}`)
      if (!resp.ok) throw new Error('Export failed')
      
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setStatus({ type: 'success', message: `Exported ${slug} successfully` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export failed'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteAll = async (slug: string) => {
    if (!confirm(`Are you SURE you want to delete ALL records in ${slug}? This cannot be undone.`)) return
    
    setLoading(`delete-${slug}`)
    try {
      const resp = await fetch(`/api/admin/bulk-delete?collection=${slug}`, { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Delete failed')
      setStatus({ type: 'success', message: `Deleted all records in ${slug}` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(`import-${slug}`)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const resp = await fetch(`/api/admin/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: slug, data })
      })
      
      const result = await resp.json()
      if (!resp.ok) throw new Error(result.error || 'Import failed')
      
      setStatus({ 
        type: 'success', 
        message: `Imported ${result.count} items into ${slug}. ${result.failed ? `${result.failed} failed.` : ''}` 
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed'
      setStatus({ type: 'error', message: `Import failed: ${message}` })
    } finally {
      setLoading(null)
      e.target.value = '' // Reset input
    }
  }

  const triggerRevalidate = async (collection: string, slug?: string) => {
    setLoading(`revalidate-${collection}`)
    try {
      const resp = await fetch(`/api/revalidate?token=${process.env.NEXT_PUBLIC_PAYLOAD_REVALIDATE_TOKEN || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          collection, 
          doc: slug ? { slug: slug.startsWith('/') ? slug : `/${slug}` } : undefined
        })
      })
      
      const result = await resp.json()
      if (!resp.ok) throw new Error(result.error || 'Revalidation failed')
      
      setStatus({ 
        type: 'success', 
        message: `Successfully revalidated: ${result.paths?.join(', ') || 'Home'}` 
      })
      if (collection === 'manual') setRevalidatePath('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Revalidation failed'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Data Management</h1>
          <p style={{ opacity: 0.7 }}>Unified control for WBJEE tools and CMS collections</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                border: '1px solid var(--theme-elevation-200, #ddd)', 
                background: 'var(--theme-elevation-100, #fff)', 
                color: 'var(--theme-text)',
                cursor: 'pointer' 
              }}
            >
             <RefreshCw size={16} className={loading === 'stats' ? 'animate-spin' : ''} />
             Refresh Stats
           </button>
        </div>
      </header>

      {status && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: status.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
          border: `1px solid ${status.type === 'success' ? 'var(--success-text)' : 'var(--error-text)'}`,
          color: status.type === 'success' ? 'var(--success-text)' : 'var(--error-text)',
          opacity: 0.9
        }}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <p style={{ margin: 0, fontWeight: 500 }}>{status.message}</p>
          <button onClick={() => setStatus(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'inherit' }}>&times;</button>
        </div>
      )}

      {/* 🚀 New Unified Sync Dashboard */}
      <SyncDashboard />

      {/* 📁 Legacy/Backup Collections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem 0' }}>Collection Backups</h2>
          <p style={{ opacity: 0.7, marginBottom: '1rem' }}>Export or import raw JSON snapshots of individual CMS collections.</p>
        </div>
        {collections.map((col) => (
          <div key={col.slug} style={{ 
            backgroundColor: 'var(--theme-elevation-50, #fff)', 
            borderRadius: '1rem', 
            border: '1px solid var(--theme-elevation-150, #e5e7eb)', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            color: 'var(--theme-text)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--theme-elevation-150, #f3f4f6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Database size={24} color="var(--theme-text)" style={{ opacity: 0.6 }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--theme-text)' }}>{col.label}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                onClick={() => handleExport(col.slug)}
                disabled={!!loading}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                  padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #d1d5db)', 
                  backgroundColor: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer', fontWeight: 500,
                  opacity: loading ? 0.5 : 1
                }}
              >
                <Download size={16} /> Export
              </button>

              <label style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #d1d5db)', 
                backgroundColor: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer', fontWeight: 500,
                opacity: loading ? 0.5 : 1
              }}>
                <Upload size={16} /> Import
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleImport(e, col.slug)}
                  disabled={!!loading}
                />
              </label>

              <button 
                onClick={() => handleDeleteAll(col.slug)}
                disabled={!!loading}
                style={{ 
                  gridColumn: 'span 2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                  padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fecaca', 
                  backgroundColor: '#fef2f2', color: '#991b1b', cursor: 'pointer', fontWeight: 600,
                  opacity: loading ? 0.5 : 1,
                  marginTop: '0.5rem'
                }}
              >
                <Trash2 size={16} /> Delete All Data
              </button>
            </div>
          </div>
        ))}
      </div>

      <section style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        backgroundColor: 'var(--theme-elevation-50, #f9fafb)', 
        borderRadius: '1rem', 
        border: '1px solid var(--theme-elevation-150, #e5e7eb)',
        color: 'var(--theme-text)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw size={24} />
          Cache & Revalidation
        </h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Trigger on-demand revalidation for specific paths or entire sections.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Custom Path Revalidation */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Manual Path Revalidation</p>
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '600px' }}>
              <input 
                type="text" 
                placeholder="/colleges/some-slug" 
                value={revalidatePath}
                onChange={(e) => setRevalidatePath(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--theme-elevation-200, #d1d5db)',
                  backgroundColor: 'var(--theme-elevation-0, #fff)',
                  color: 'var(--theme-text)'
                }}
              />
              <button 
                onClick={() => triggerRevalidate('manual', revalidatePath)}
                disabled={!!loading || !revalidatePath}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  background: '#111827', 
                  color: '#fff', 
                  fontWeight: 500, 
                  border: 'none', 
                  cursor: (loading || !revalidatePath) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !revalidatePath) ? 0.5 : 1
                }}
              >
                Revalidate Path
              </button>
            </div>
          </div>

          {/* Bulk Collection Revalidation */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bulk Section Revalidation</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button 
                onClick={() => triggerRevalidate('colleges')}
                disabled={!!loading}
                style={{ 
                  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', 
                  border: '1px solid var(--theme-elevation-200, #d1d5db)',
                  background: 'var(--theme-elevation-100, #fff)', color: 'var(--theme-text)',
                  fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
                }}
              >
                All Colleges
              </button>
              <button 
                onClick={() => triggerRevalidate('posts')}
                disabled={!!loading}
                style={{ 
                  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', 
                  border: '1px solid var(--theme-elevation-200, #d1d5db)',
                  background: 'var(--theme-elevation-100, #fff)', color: 'var(--theme-text)',
                  fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
                }}
              >
                All Posts
              </button>
              <button 
                onClick={() => triggerRevalidate('timeline')}
                disabled={!!loading}
                style={{ 
                  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', 
                  border: '1px solid var(--theme-elevation-200, #d1d5db)',
                  background: 'var(--theme-elevation-100, #fff)', color: 'var(--theme-text)',
                  fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
                }}
              >
                Full Timeline
              </button>
              <button 
                onClick={() => triggerRevalidate('home')}
                disabled={!!loading}
                style={{ 
                  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', 
                  border: '1px solid #111827',
                  background: '#111827', color: '#fff',
                  fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
                }}
              >
                Home Page Only
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
