'use client'
import React, { useState } from 'react'
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export interface College {
  id: string
  name: string
  logo?: string | { id: string, filename: string }
  seoDescription?: string
  highlights?: unknown[]
}

export default function QualityAuditClient({ initialColleges }: { initialColleges: College[] }) {
  const [search, setSearch] = useState('')
  
  const analyzedColleges = initialColleges.map(college => {
    const issues = []
    if (!college.logo) issues.push('Missing Logo')
    if (!college.seoDescription || college.seoDescription.trim().length < 10) issues.push('Incomplete SEO')
    if (!college.highlights || college.highlights.length === 0) issues.push('No Highlights')
    
    return {
      ...college,
      issues,
      score: Math.round(((3 - issues.length) / 3) * 100)
    }
  })

  const filteredColleges = analyzedColleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.issues.some((i: string) => i.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => a.score - b.score)

  const stats = {
    total: analyzedColleges.length,
    perfect: analyzedColleges.filter(c => c.issues.length === 0).length,
    incomplete: analyzedColleges.filter(c => c.issues.length > 0).length,
    avgScore: Math.round(analyzedColleges.reduce((acc, c) => acc + c.score, 0) / analyzedColleges.length)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={32} color="#dc2626" />
          Quality Audit Hub
        </h1>
        <p style={{ opacity: 0.6 }}>Identify and fix incomplete data across your college database.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)' }}>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.875rem' }}>Overall Quality</p>
          <p style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: stats.avgScore > 80 ? '#16a34a' : '#ca8a04' }}>{stats.avgScore}%</p>
        </div>
        <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)' }}>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.875rem' }}>Perfect Records</p>
          <p style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.perfect}</p>
        </div>
        <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)' }}>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.875rem' }}>Incomplete Records</p>
          <p style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.incomplete}</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={20} />
        <input 
          type="text" 
          placeholder="Search colleges or issues..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '1rem 1rem 1rem 3rem', 
            borderRadius: '0.75rem', 
            border: '1px solid var(--theme-elevation-150, #e5e7eb)',
            fontSize: '1rem',
            backgroundColor: 'var(--theme-elevation-50, #fff)',
            color: 'inherit'
          }}
        />
      </div>

      <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--theme-elevation-100, #f9fafb)', borderBottom: '1px solid var(--theme-elevation-200, #e5e7eb)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600 }}>College Name</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Health Score</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Issues found</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredColleges.map(college => (
              <tr key={college.id} style={{ borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{college.name}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '60px', height: '8px', backgroundColor: 'var(--theme-elevation-150, #e5e7eb)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${college.score}%`, height: '100%', backgroundColor: college.score === 100 ? '#16a34a' : college.score > 50 ? '#ca8a04' : '#dc2626' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{college.score}%</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {college.issues.map((issue: string) => (
                      <span key={issue} style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem', 
                        backgroundColor: '#fef2f2', 
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <AlertCircle size={12} />
                        {issue}
                      </span>
                    ))}
                    {college.issues.length === 0 && (
                      <span style={{ color: '#16a34a', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={16} /> All good
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link 
                    href={`/admin/collections/colleges/${college.id}`}
                    style={{ 
                      color: '#2563eb', 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    Edit <ExternalLink size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredColleges.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
            No colleges matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
