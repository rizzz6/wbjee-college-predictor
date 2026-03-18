'use client'
import React, { useState, useMemo } from 'react'
import { 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  Target,
  FileSearch,
  ImageIcon,
  EyeOff,
  Filter,
  Activity,
  ShieldQuestion,
  Award
} from 'lucide-react'
import Link from 'next/link'

export interface College {
  id: string
  name: string
  slug: string
  logo?: string | { id: string, filename: string }
  coverImage?: string | { id: string, filename: string }
  website?: string
  seoDescription?: string
  highlights?: { text: string }[]
  overview?: unknown
  feesStats?: { totalCourseFeeAmount?: number }
  rankingHistory?: unknown[]
  isVisible: boolean
  cutoffSourceName?: string
}

export interface MediaItem {
  id: string
  filesize: number
  filename: string
}

export interface PlacementReport {
  college: string | { id: string }
  sourceReliability?: 'high' | 'medium' | 'low'
}

type AuditTab = 'critical' | 'content' | 'performance' | 'reliability' | 'visibility'

interface TabButtonProps {
  id: AuditTab
  label: string
  icon: React.ElementType
  count: number
  activeTab: AuditTab
  setActiveTab: (tab: AuditTab) => void
}

const TabButton = ({ id, label, icon: Icon, count, activeTab, setActiveTab }: TabButtonProps) => (
  <button 
    onClick={() => setActiveTab(id)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: activeTab === id ? '#111827' : 'var(--theme-elevation-100)',
      color: activeTab === id ? '#fff' : 'var(--theme-text)',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
      boxShadow: activeTab === id ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
    }}
  >
    <Icon size={16} />
    {label}
    {count > 0 && (
      <span style={{ 
        backgroundColor: id === 'critical' ? '#ef4444' : id === 'reliability' ? '#9333ea' : '#f59e0b', 
        color: '#fff', 
        padding: '1px 6px', 
        borderRadius: '10px', 
        fontSize: '0.7rem' 
      }}>
        {count}
      </span>
    )}
  </button>
)

export default function QualityAuditClient({ 
  initialColleges, 
  mediaItems = [],
  placementReports = [],
  _hasAnyCutoffs = false 
}: { 
  initialColleges: College[],
  mediaItems: MediaItem[],
  placementReports: PlacementReport[],
  _hasAnyCutoffs?: boolean
}) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<AuditTab>('critical')
  const [showGuide, setShowGuide] = useState(false)
  
  // 1. Pre-calculate SEO Clones
  const seoClones = useMemo(() => {
    const map = new Map<string, string[]>()
    initialColleges.forEach(c => {
      if (c.seoDescription && c.seoDescription.trim().length > 10) {
        const desc = c.seoDescription.trim().toLowerCase()
        if (!map.has(desc)) map.set(desc, [])
        map.get(desc)?.push(c.id)
      }
    })
    return map
  }, [initialColleges])

  // 2. Map Media Sizes
  const mediaSizeMap = useMemo(() => {
    const map = new Map<string, number>()
    mediaItems.forEach(m => map.set(m.id, m.filesize))
    return map
  }, [mediaItems])

  // 3. Map Placement Reliability
  const reliabilityMap = useMemo(() => {
    const map = new Map<string, string>()
    placementReports.forEach(r => {
      const id = typeof r.college === 'object' ? r.college.id : r.college
      if (r.sourceReliability) map.set(id, r.sourceReliability)
    })
    return map
  }, [placementReports])

  // 4. Analyze each college
  const analyzedColleges = useMemo(() => {
    return initialColleges.map(college => {
      const issues: { type: 'critical' | 'warning' | 'info', message: string, tab: AuditTab }[] = []
      let score = 0

      // CORE (30 pts)
      if (college.cutoffSourceName) score += 20 
      else issues.push({ type: 'critical', message: 'No Data Connection', tab: 'critical' })

      if (college.logo) score += 10
      else issues.push({ type: 'critical', message: 'Missing Logo', tab: 'content' })

      // IDENTITY & CONTENT (30 pts)
      let desc = college.seoDescription?.toLowerCase() || ''

      if (college.website && college.website.includes('.')) score += 10
      else issues.push({ type: 'warning', message: 'No Website Link', tab: 'content' })

      if (college.coverImage) score += 10
      else issues.push({ type: 'warning', message: 'Missing Cover Image', tab: 'content' })

      const overviewLen = college.overview ? JSON.stringify(college.overview).length : 0
      if (overviewLen > 1000) {
        score += 10
        issues.push({ type: 'info', message: 'Gold Content Depth', tab: 'content' })
      } else if (overviewLen > 500) {
        score += 7
        issues.push({ type: 'info', message: 'Silver Content Depth', tab: 'content' })
      } else if (overviewLen > 200) {
        score += 4
        issues.push({ type: 'info', message: 'Bronze Content Depth', tab: 'content' })
      } else {
        issues.push({ type: 'warning', message: 'Thin Overview Content', tab: 'content' })
      }

      // STATS & RELIABILITY (20 pts)
      if (college.feesStats?.totalCourseFeeAmount && college.feesStats.totalCourseFeeAmount > 0) score += 10
      else issues.push({ type: 'warning', message: 'Missing Fee Info', tab: 'content' })

      const reliability = reliabilityMap.get(college.id)
      if (reliability === 'high') score += 10
      else if (reliability === 'medium') {
        score += 5
        issues.push({ type: 'info', message: 'Med Reliability Data', tab: 'reliability' })
      } else {
        issues.push({ type: 'warning', message: 'Low/Missing Reliability', tab: 'reliability' })
      }

      // SEO & QUALITY (20 pts)
      if (college.highlights && college.highlights.length >= 4) score += 10
      else issues.push({ type: 'warning', message: 'Few Highlights (<4)', tab: 'content' })

      // SEO Logic
      desc = college.seoDescription?.toLowerCase().trim() || ''
      const name = college.name.toLowerCase()
      const hasKeyword = desc.includes(name) || name.split(' ').some(word => word.length > 3 && desc.includes(word))
      const isUnique = !desc || (seoClones.get(desc)?.length || 0) <= 1
      
      if (desc.length >= 50 && desc.length <= 160 && hasKeyword && isUnique) {
        score += 10
      } else {
        if (!isUnique) issues.push({ type: 'warning', message: 'Duplicate SEO Description', tab: 'content' })
        if (!hasKeyword && desc.length > 0) issues.push({ type: 'warning', message: 'SEO Missing College Name', tab: 'content' })
        if (desc.length > 0 && (desc.length < 50 || desc.length > 160)) issues.push({ type: 'warning', message: 'Bad SEO Length', tab: 'content' })
      }

      // Performance Override
      const logoId = (college.logo && typeof college.logo === 'object') ? college.logo.id : (typeof college.logo === 'string' ? college.logo : null)
      if (logoId && (mediaSizeMap.get(logoId) || 0) > 300000) {
        score = Math.max(0, score - 10)
        issues.push({ type: 'warning', message: 'Heavy Media Hit', tab: 'performance' })
      }

      if (!college.isVisible) issues.push({ type: 'info', message: 'Hidden from Public', tab: 'visibility' })

      return { ...college, issues, score }
    })
  }, [initialColleges, seoClones, mediaSizeMap, reliabilityMap])

  // Filters
  const filteredColleges = useMemo(() => {
    return analyzedColleges.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesTab = c.issues.some(i => i.tab === activeTab)
      return matchesSearch && matchesTab
    }).sort((a, b) => a.score - b.score)
  }, [analyzedColleges, search, activeTab])

  const stats = {
    total: analyzedColleges.length,
    criticalCount: analyzedColleges.filter(c => c.issues.some(i => i.type === 'critical')).length,
    lowReliability: analyzedColleges.filter(c => c.issues.some(i => i.tab === 'reliability')).length,
    avgScore: Math.round(analyzedColleges.reduce((acc, c) => acc + c.score, 0) / (analyzedColleges.length || 1))
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={32} color="#dc2626" />
          Data Quality Center
        </h1>
        <p style={{ opacity: 0.6 }}>Mining content for reliability, SEO keywords, and depth gradients.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '1rem', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.875rem' }}>Global Health Score</p>
            <Activity size={20} color="#10b981" />
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.avgScore}%</p>
          <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '1rem' }}>
             <div style={{ height: '100%', width: `${stats.avgScore}%`, background: '#10b981', borderRadius: '2px' }} />
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, opacity: 0.8, textTransform: 'uppercase' }}>Scoring Guide:</p>
              <button onClick={() => setShowGuide(!showGuide)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>i</button>
            </div>
            {showGuide && (
              <div style={{ position: 'absolute', top: '100%', right: 0, width: '280px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', zIndex: 50, marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><strong style={{ fontSize: '0.8rem' }}>Audit Criteria</strong><button onClick={() => setShowGuide(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>&times;</button></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    { label: 'Predictor Link', pts: '+20', hint: 'Matched via Source ID' },
                    { label: 'Visual Brand', pts: '+20', hint: 'Logo & Cover Image presence' },
                    { label: 'Data Utility', pts: '+20', hint: 'Website & Fee stats filled' },
                    { label: 'Content Depth', pts: '+10', hint: 'Gold/Silver/Bronze overview tiers' },
                    { label: 'Reliable Source', pts: '+10', hint: 'Placement data source is High' },
                    { label: 'SEO Keyword', pts: '+10', hint: 'Description must contain college name' },
                    { label: 'SEO Standards', pts: '+10', hint: 'Length 50-160 & unique' },
                  ].map((rule, i) => (
                    <div key={i} title={rule.hint} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.9, cursor: 'help', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{rule.label}</span><span style={{ color: '#10b981', fontWeight: 'bold' }}>{rule.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150)' }}>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.875rem' }}>Critical Issues</p>
          <p style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.criticalCount}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626', opacity: 0.8 }}>Immediate Fix Required</p>
        </div>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150)' }}>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.875rem' }}>Low Reliability</p>
          <p style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#9333ea' }}>{stats.lowReliability}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>AI/Estimated Data</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <TabButton id="critical" label="Critical" icon={Target} count={analyzedColleges.filter(c => c.issues.some(i => i.tab === 'critical')).length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="content" label="Content & SEO" icon={FileSearch} count={analyzedColleges.filter(c => c.issues.some(i => i.tab === 'content')).length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="reliability" label="Reliability" icon={ShieldQuestion} count={analyzedColleges.filter(c => c.issues.some(i => i.tab === 'reliability')).length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="performance" label="Performance" icon={ImageIcon} count={analyzedColleges.filter(c => c.issues.some(i => i.tab === 'performance')).length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="visibility" label="Status" icon={EyeOff} count={analyzedColleges.filter(c => c.issues.some(i => i.tab === 'visibility')).length} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={20} />
          <input type="text" placeholder="Search colleges..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--theme-elevation-150)', fontSize: '1rem', backgroundColor: 'var(--theme-elevation-50)', color: 'inherit' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--theme-elevation-50)', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--theme-elevation-100)', borderBottom: '1px solid var(--theme-elevation-200)' }}>
            <tr><th style={{ padding: '1.25rem 1rem' }}>College</th><th style={{ padding: '1.25rem 1rem' }}>Health</th><th style={{ padding: '1.25rem 1rem' }}>Audit Findings</th><th style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>Action</th></tr>
          </thead>
          <tbody>
            {filteredColleges.map(college => (
              <tr key={college.id} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600 }}>{college.name}</div><div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{college.slug}</div></td>
                <td style={{ padding: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '60px', height: '8px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${college.score}%`, height: '100%', backgroundColor: college.score >= 80 ? '#16a34a' : college.score > 40 ? '#ca8a04' : '#dc2626' }} /></div><span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{college.score}%</span></div></td>
                <td style={{ padding: '1rem' }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {college.issues.filter(i => i.tab === activeTab).map((issue, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', backgroundColor: issue.type === 'critical' ? '#fef2f2' : issue.type === 'warning' ? '#fffbeb' : '#eff6ff', color: issue.type === 'critical' ? '#991b1b' : issue.type === 'warning' ? '#92400e' : '#1e40af', border: `1px solid ${issue.type === 'critical' ? '#fecaca' : issue.type === 'warning' ? '#fde68a' : '#bfdbfe'}`, display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      {issue.message.includes('Gold') ? <Award size={10} color="#ca8a04" /> : issue.message.includes('Reliability') ? <ShieldQuestion size={10} /> : <Filter size={10} />}
                      {issue.message}
                    </span>
                  ))}
                </div></td>
                <td style={{ padding: '1rem', textAlign: 'right' }}><Link href={`/admin/collections/colleges/${college.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '0.5rem', color: 'var(--theme-text)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>Fix <ExternalLink size={12} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredColleges.length === 0 && <div style={{ padding: '5rem', textAlign: 'center' }}><CheckCircle2 size={48} color="#16a34a" style={{ opacity: 0.2, marginBottom: '1rem' }} /><p style={{ opacity: 0.5 }}>No issues found in this category.</p></div>}
      </div>
    </div>
  )
}
