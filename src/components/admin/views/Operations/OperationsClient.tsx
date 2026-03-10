'use client'
import React, { useState } from 'react'
import { 
  Rocket, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Settings,
  Terminal,
  Clock,
  FileText,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'

interface DeployHook {
  name: string
  url: string
}

export default function OperationsClient({ deployHooks = [] }: { deployHooks: DeployHook[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<{ id: string, type: 'success' | 'error', message: string } | null>(null)
  const [output, setOutput] = useState<{ id: string, stdout: string } | null>(null)

  const handleDeploy = async (hook: DeployHook) => {
    setLoading(`deploy-${hook.name}`)
    try {
      const resp = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hookUrl: hook.url })
      })
      if (!resp.ok) throw new Error('Deploy hook failed')
      setStatus({ id: hook.name, type: 'success', message: `Triggered ${hook.name} deployment successfully.` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deploy hook failed'
      setStatus({ id: hook.name, type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  const handleBuildScript = async (scriptKey: string, label: string) => {
    setLoading(`build-${scriptKey}`)
    setStatus(null)
    setOutput(null)
    try {
      const resp = await fetch(`/api/admin/build?script=${scriptKey}`, { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Build script failed')
      
      setStatus({ id: scriptKey, type: 'success', message: `${label} completed successfully.` })
      setOutput({ id: scriptKey, stdout: data.stdout })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Build script failed'
      setStatus({ id: scriptKey, type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  const handleBulkTool = async (id: string, label: string, api: string) => {
    setLoading(id)
    setStatus(null)
    try {
      const resp = await fetch(api, { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Operation failed')
      setStatus({ id, type: 'success', message: `${label}: ${data.message}` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      setStatus({ id, type: 'error', message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={32} color="var(--theme-text)" />
          Operations Hub
        </h1>
        <p style={{ opacity: 0.7, color: 'var(--theme-text)' }}>Manage deployments and build pipelines for the rwbjee platform.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        {/* Deployment Section */}
        <section style={{ 
          backgroundColor: 'var(--theme-elevation-50, #fff)', 
          borderRadius: '1rem', 
          border: '1px solid var(--theme-elevation-150, #e5e7eb)', 
          padding: '1.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: 'var(--theme-text)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Rocket size={20} color="#3b82f6" />
               Vercel Deployments
             </h2>
             <Link href="/admin/globals/site-settings" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none' }}>
               Manage Hooks
             </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {deployHooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #e5e7eb', borderRadius: '0.75rem' }}>
                <p style={{ opacity: 0.5, marginBottom: '1rem' }}>No deploy hooks configured.</p>
                <Link href="/admin/globals/site-settings" style={{ backgroundColor: '#111827', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Add your first hook
                </Link>
              </div>
            ) : (
              deployHooks.map((hook) => (
                <div key={hook.name} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1rem', 
                  backgroundColor: 'var(--theme-elevation-100, #f9fafb)', 
                  borderRadius: '0.75rem', 
                  border: '1px solid var(--theme-elevation-150, #f3f4f6)' 
                }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0 }}>{hook.name}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>{hook.url.substring(0, 30)}...</p>
                  </div>
                  <button 
                    onClick={() => handleDeploy(hook)}
                    disabled={!!loading}
                    style={{ 
                      backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading === `deploy-${hook.name}` ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                    Deploy
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Build Scripts Section */}
        <section style={{ 
          backgroundColor: 'var(--theme-elevation-50, #fff)', 
          borderRadius: '1rem', 
          border: '1px solid var(--theme-elevation-150, #e5e7eb)', 
          padding: '1.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: 'var(--theme-text)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="#8b5cf6" />
            Static Data Builders
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { id: 'metadata', label: 'Build Metadata', desc: 'Regenerate SEO and internal mapping files.', icon: Zap },
              { id: 'cutoffs', label: 'Build Cutoffs Data', desc: 'Slices large JSON for the college predictor.', icon: Terminal },
              { id: 'mobile', label: 'Generate Static Slices', desc: 'Pre-builds data chunks for mobile optimization.', icon: Clock },
            ].map((script) => (
              <div key={script.id} style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--theme-elevation-100, #f9fafb)', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--theme-elevation-150, #f3f4f6)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, margin: 0, fontSize: '1rem' }}>{script.label}</h3>
                    <p style={{ fontSize: '0.825rem', opacity: 0.6, margin: '0.25rem 0' }}>{script.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleBuildScript(script.id, script.label)}
                    disabled={!!loading}
                    style={{ 
                      backgroundColor: '#111827', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading === `build-${script.id}` ? <Loader2 size={16} className="animate-spin" /> : <script.icon size={16} />}
                    Run Script
                  </button>
                </div>
                
                {status?.id === script.id && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', 
                    color: status.type === 'success' ? '#166534' : '#991b1b',
                    padding: '0.5rem', backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem'
                  }}>
                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {status.message}
                  </div>
                )}

                {output?.id === script.id && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#1e293b', color: '#cbd5e1', borderRadius: '0.375rem', fontSize: '0.7rem', maxHeight: '150px', overflowY: 'auto', fontFamily: 'monospace' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output.stdout}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bulk Content Tools */}
        <section style={{ 
          backgroundColor: 'var(--theme-elevation-50, #fff)', 
          borderRadius: '1rem', 
          border: '1px solid var(--theme-elevation-150, #e5e7eb)', 
          padding: '1.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: 'var(--theme-text)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#f59e0b" />
            Bulk Content Tools
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { id: 'bulk-seo', label: 'Generate Bulk SEO', desc: 'Auto-fill missing SEO descriptions using templates.', icon: FileText, api: '/api/admin/bulk-seo' },
              { id: 'media-match', label: 'Match Media Icons', desc: 'Auto-link media items to colleges by name.', icon: ImageIcon, api: '/api/admin/media-match' },
            ].map((tool) => (
              <div key={tool.id} style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--theme-elevation-100, #f9fafb)', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--theme-elevation-150, #f3f4f6)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                   <div>
                     <h3 style={{ fontWeight: 600, margin: 0, fontSize: '1rem' }}>{tool.label}</h3>
                     <p style={{ fontSize: '0.825rem', opacity: 0.6, margin: '0.25rem 0' }}>{tool.desc}</p>
                   </div>
                   <button 
                     onClick={() => handleBulkTool(tool.id, tool.label, tool.api)}
                     disabled={!!loading}
                     style={{ 
                       backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer',
                       display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.5 : 1
                     }}
                   >
                     {loading === tool.id ? <Loader2 size={16} className="animate-spin" /> : <tool.icon size={16} />}
                     Run Tool
                   </button>
                </div>
                {status?.id === tool.id && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', 
                    color: status.type === 'success' ? '#166534' : '#991b1b',
                    padding: '0.5rem', backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem', marginTop: '0.5rem'
                  }}>
                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {status.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
