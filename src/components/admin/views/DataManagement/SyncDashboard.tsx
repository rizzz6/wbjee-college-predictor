
'use client';
import React, { useState } from 'react';
import { 
  RefreshCw, 
  Zap, 
  Database, 
  Layout, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet
} from 'lucide-react';

interface SyncLog {
    message: string;
    timestamp: string;
    type: 'info' | 'success' | 'error';
}

export default function SyncDashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{
            message,
            timestamp: new Date().toLocaleTimeString(),
            type
        }, ...prev]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            addLog(`Selected file: ${e.target.files[0].name}`, 'info');
        }
    };

    const runSync = async (action: 'full' | 'import' | 'cms' | 'redis' | 'finder') => {
        if (action === 'full' && !file) {
            alert('Please select a CSV file first');
            return;
        }

        setSyncing(true);
        setStatus('syncing');
        setLogs([]);
        addLog(`Starting ${action.toUpperCase()} sync...`, 'info');

        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            formData.append('action', action);

            const resp = await fetch('/api/admin/sync', {
                method: 'POST',
                body: formData
            });

            const result = await resp.json();

            if (!resp.ok) throw new Error(result.error || 'Sync failed');

            if (result.logs) {
                result.logs.forEach((log: string) => addLog(log, 'success'));
            }

            setStatus('success');
            addLog('Sync completed successfully!', 'success');
        } catch (err: unknown) {
            setStatus('error');
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            addLog(message, 'error');
            console.error('Sync Error:', err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <section style={{ 
            marginTop: '3rem', 
            padding: '2rem', 
            backgroundColor: 'var(--theme-elevation-50, #f9fafb)', 
            borderRadius: '1rem', 
            border: '1px solid var(--theme-elevation-150, #e5e7eb)',
            color: 'var(--theme-text)'
        }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Zap size={24} color="#f59e0b" fill="#f59e0b" />
                    WBJEE Tools Sync
                </h2>
                <p style={{ opacity: 0.7 }}>Unified pipeline to update Predictor (Redis) and Finder (Supabase/Static) data.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Left: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* CSV Upload Area */}
                    <div style={{ 
                        border: '2px dashed var(--theme-elevation-200, #d1d5db)', 
                        borderRadius: '0.75rem', 
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: file ? 'var(--theme-elevation-100, #f3f4f6)' : 'transparent',
                        transition: 'all 0.2s'
                    }}>
                        <input 
                            type="file" 
                            id="csv-upload" 
                            accept=".csv" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <FileSpreadsheet size={40} style={{ opacity: 0.5 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <strong style={{ fontSize: '1rem' }}>{file ? file.name : 'Click to upload cutoffs-import.csv'}</strong>
                                <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Required for Full Sync or Import only'}</span>
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => runSync('full')}
                            disabled={syncing}
                            style={{ 
                                flex: '1 1 100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', 
                                padding: '1.25rem', borderRadius: '0.5rem', 
                                background: 'var(--theme-elevation-0, #fff)', 
                                color: 'var(--theme-text, #111827)', 
                                fontWeight: 'bold', 
                                border: '1px solid var(--theme-elevation-250, #d1d5db)', 
                                cursor: syncing ? 'not-allowed' : 'pointer',
                                opacity: syncing ? 0.7 : 1, 
                                fontSize: '1.1rem',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <RefreshCw size={22} className={syncing ? 'animate-spin' : ''} color="#2563eb" />
                            {syncing ? 'Syncing...' : 'One-Click Full Sync (All Steps)'}
                        </button>

                        <button 
                            onClick={() => runSync('import')}
                            disabled={syncing}
                            style={{ 
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #ddd)', 
                                background: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer'
                            }}
                        >
                            <Database size={16} /> Import CSV
                        </button>

                        <button 
                            onClick={() => runSync('cms')}
                            disabled={syncing}
                            style={{ 
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #ddd)', 
                                background: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer'
                            }}
                        >
                            <Layout size={16} /> Sync to CMS
                        </button>

                        <button 
                            onClick={() => runSync('redis')}
                            disabled={syncing}
                            style={{ 
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #ddd)', 
                                background: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer'
                            }}
                        >
                            <Activity size={16} /> Update Redis
                        </button>

                        <button 
                            onClick={() => runSync('finder')}
                            disabled={syncing}
                            style={{ 
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--theme-elevation-200, #ddd)', 
                                background: 'var(--theme-elevation-0, #fff)', color: 'var(--theme-text)', cursor: 'pointer'
                            }}
                        >
                            <FileSpreadsheet size={16} /> Build Finder JSON
                        </button>
                    </div>
                </div>

                {/* Right: Real-time Logs */}
                <div style={{ 
                    backgroundColor: '#111827', 
                    borderRadius: '0.75rem', 
                    padding: '1.25rem',
                    color: '#d1d5db',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    height: '350px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>Live Output</span>
                        {status === 'syncing' && <Clock size={16} className="animate-spin" />}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem' }}>
                        {logs.length === 0 ? (
                            <div style={{ opacity: 0.4 }}>Waiting for process...</div>
                        ) : logs.map((log, i) => (
                            <div key={i} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#10b981' : 'inherit' }}>
                                <span style={{ opacity: 0.5 }}>[{log.timestamp}]</span> {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            {status !== 'idle' && (
                 <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    backgroundColor: status === 'success' ? '#ecfdf5' : status === 'error' ? '#fef2f2' : '#eff6ff',
                    border: `1px solid ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#3b82f6'}`,
                    color: status === 'success' ? '#065f46' : status === 'error' ? '#991b1b' : '#1e40af'
                }}>
                    {status === 'success' ? <CheckCircle2 size={20} /> : status === 'error' ? <XCircle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
                    <strong style={{ margin: 0 }}>
                        {status === 'success' ? 'All tools are now updated and live!' : status === 'error' ? 'Sync encountered an error. Check logs.' : 'Processing data pipeline...'}
                    </strong>
                </div>
            )}
        </section>
    );
}
