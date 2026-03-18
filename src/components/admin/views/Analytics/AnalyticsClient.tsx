'use client'
import React, { useState, useMemo } from 'react'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Database,
  Layers,
  Calendar,
  Wallet,
  TrendingUp as RoiIcon,
  List as ListIcon,
  Zap,
  ShieldCheck,
  TrendingUp as TrendIcon,
  ArrowUpRight
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ScatterController,
  LogarithmicScale,
  TooltipItem
} from 'chart.js'
import { Bar, Pie, Scatter } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
)

export interface TypeDoc {
  type: string
}

export interface FeeDoc {
  id: string
  name?: string
  feesStats?: {
    totalCourseFeeAmount?: number
  }
}

export interface PlacementDoc {
  college: string | { id: string, name: string }
  averagePackageLpa?: number
}

export interface CutoffEntry {
  year: number
  program: string
  seatType: string
  round: string
  openingRank?: number
  closingRank?: number
}

export interface CutoffDoc {
  institute: string
  college?: string | { id: string, name: string }
  cutoffs?: CutoffEntry[]
}

export default function AnalyticsClient({ 
  totalColleges, 
  typeDocs, 
  feeDocs = [],
  cutoffDocs = [],
  placementDocs = []
}: { 
  totalColleges: number, 
  typeDocs: TypeDoc[], 
  feeDocs?: FeeDoc[],
  cutoffDocs?: CutoffDoc[],
  placementDocs?: PlacementDoc[]
}) {
  const [examFilter, setExamFilter] = useState<'WBJEE' | 'JEEM'>('WBJEE')
  
  // 0. Base Data Helpers
  const allCutoffEntries = useMemo(() => {
    const entries: (CutoffEntry & { institute: string })[] = []
    cutoffDocs.forEach(doc => {
      if (doc.cutoffs && Array.isArray(doc.cutoffs)) {
        doc.cutoffs.forEach(c => entries.push({ ...c, institute: doc.institute }))
      }
    })
    return entries
  }, [cutoffDocs])

  const globalMaxRank = useMemo(() => {
    let max = 100000
    allCutoffEntries.forEach(e => {
      if (e.closingRank && e.closingRank > max) max = e.closingRank
    })
    return max
  }, [allCutoffEntries])

  // Filtered entries for specific analysis
  const filteredCutoffEntries = useMemo(() => {
    return allCutoffEntries.filter(e => {
      const isJeem = e.seatType?.toUpperCase().includes('JEEM') || e.seatType?.toUpperCase().includes('ALL INDIA')
      return examFilter === 'JEEM' ? isJeem : !isJeem
    })
  }, [allCutoffEntries, examFilter])

  // 1. Counseling Pressure Index (CPI) Logic
  const cpiAnalysis = useMemo(() => {
    const institutePressure: Record<string, { totalScore: number }> = {}
    const logMax = Math.log(globalMaxRank + 1000)

    // Group by institute for the filtered dataset
    const instGrouped = new Map<string, CutoffEntry[]>()
    filteredCutoffEntries.forEach(e => {
      if (!instGrouped.has(e.institute)) instGrouped.set(e.institute, [])
      instGrouped.get(e.institute)?.push(e)
    })

    instGrouped.forEach((cutoffs, institute) => {
      const latestYear = Math.max(...cutoffs.map(c => c.year || 0))
      const groupings: Record<string, { r1?: number, final?: number }> = {}

      cutoffs.filter(c => c.year === latestYear).forEach(c => {
        const key = `${c.program}-${c.seatType}`
        if (!groupings[key]) groupings[key] = {}
        const roundNum = String(c.round).toLowerCase()
        if (roundNum.includes('1')) groupings[key].r1 = c.closingRank
        if (!groupings[key].final || (c.closingRank && c.closingRank > (groupings[key].final || 0))) {
            groupings[key].final = c.closingRank
        }
      })

      let instScoreSum = 0
      let instCount = 0
      const branchScores: number[] = []

      Object.values(groupings).forEach(g => {
        if (g.r1 && g.final && g.final > 0) {
          const retention = 1 - (g.final - g.r1) / g.final
          const selectivity = 1 - (Math.log(g.final) / logMax)
          const intensity = (retention * 0.3) + (selectivity * 0.7)
          instScoreSum += intensity
          instCount++
          branchScores.push(intensity)
        }
      })

      if (instCount > 0) {
        // Prestige Blend: 70% from BEST branch, 30% from average
        const avgScore = instScoreSum / instCount
        const maxScore = Math.max(...branchScores)
        const finalInstScore = (maxScore * 0.7) + (avgScore * 0.3)
        institutePressure[institute] = { totalScore: finalInstScore }
      }
    })

    const rawLeaders = Object.entries(institutePressure)
      .map(([name, data]) => ({ name, raw: data.totalScore }))
      .sort((a, b) => b.raw - a.raw)

    if (rawLeaders.length === 0) return []
    const maxVal = rawLeaders[0].raw
    const minVal = rawLeaders[rawLeaders.length - 1].raw
    const range = maxVal - minVal || 1

    return rawLeaders.map(item => ({
      name: item.name,
      cpi: ((item.raw - minVal) / range) * 100
    }))
  }, [filteredCutoffEntries, globalMaxRank])

  // 2. Mathematical Tiering Consistency
  const marketTiers = useMemo(() => {
    const tiers = { 'Tier 1 (Elite)': 0, 'Tier 2 (High-Perf)': 0, 'Tier 3 (Standard)': 0 }
    
    const instGrouped = new Map<string, CutoffEntry[]>()
    allCutoffEntries.forEach(e => {
      if (!instGrouped.has(e.institute)) instGrouped.set(e.institute, [])
      instGrouped.get(e.institute)?.push(e)
    })

    instGrouped.forEach((cutoffs) => {
      const latestYear = Math.max(...cutoffs.map(c => c.year || 0))
      const finalRanks = cutoffs
        .filter(c => c.year === latestYear && c.closingRank)
        .map(c => c.closingRank as number)
      if (finalRanks.length === 0) return
      const under5kCount = finalRanks.filter(r => r < 5000).length
      const medianRank = [...finalRanks].sort((a, b) => a - b)[Math.floor(finalRanks.length / 2)]
      if (under5kCount / finalRanks.length >= 0.6) tiers['Tier 1 (Elite)']++
      else if (medianRank < 15000) tiers['Tier 2 (High-Perf)']++
      else tiers['Tier 3 (Standard)']++
    })
    return {
      labels: Object.keys(tiers),
      datasets: [{ data: Object.values(tiers), backgroundColor: ['#1e293b', '#2563eb', '#94a3b8'], borderWidth: 0 }]
    }
  }, [allCutoffEntries])

  // 3. Market Shift (2024 vs 2025)
  const marketShift = useMemo(() => {
    const counts2024: Record<string, number> = {}
    const counts2025: Record<string, number> = {}
    const programInstMap: Record<string, Set<string>> = {}
    
    allCutoffEntries.forEach(e => {
      const key = `${e.year}-${e.program}`
      if (!programInstMap[key]) programInstMap[key] = new Set()
      programInstMap[key].add(e.institute)
    })

    Object.entries(programInstMap).forEach(([key, insts]) => {
      const parts = key.split('-')
      const year = parts[0]
      const program = parts.slice(1).join('-')
      if (year === '2024') counts2024[program] = insts.size
      if (year === '2025') counts2025[program] = insts.size
    })

    return Object.keys(counts2025).map(prog => {
      const prev = counts2024[prog] || 0
      const curr = counts2025[prog]
      const diff = curr - prev
      const pct = prev > 0 ? (diff / prev) * 100 : (curr > 0 ? 100 : 0)
      return { name: prog, prev, curr, diff, pct }
    })
    .filter(s => s.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 30)
  }, [allCutoffEntries])

  // 4. ROI Analytics
  const roiAnalysis = useMemo(() => {
    const items: { name: string, fees: number, pkg: number, roi: number }[] = []
    placementDocs.forEach(p => {
      const collegeId = typeof p.college === 'object' ? p.college.id : p.college
      const feeDoc = feeDocs.find(f => f.id === collegeId)
      const avgPackage = p.averagePackageLpa || 0
      const totalFees = feeDoc?.feesStats?.totalCourseFeeAmount || 0
      if (avgPackage > 0 && totalFees > 0) {
        const roiValue = (avgPackage * 100000) / totalFees
        items.push({ name: feeDoc?.name || 'Unknown', fees: totalFees, pkg: avgPackage, roi: Number(roiValue.toFixed(2)) })
      }
    })
    const sortedItems = [...items].sort((a, b) => b.roi - a.roi)
    
    const scatterData = {
      datasets: [{
        label: 'Colleges (ROI Distribution)',
        data: sortedItems.map(item => ({ 
          x: item.fees, 
          y: item.pkg, 
          name: item.name, 
          roi: item.roi 
        })),
        backgroundColor: '#10b981', pointRadius: 6, pointHoverRadius: 10,
      }]
    }
    return { scatterData, sortedItems }
  }, [placementDocs, feeDocs])

  // 5. Branch Competitiveness
  const branchHardness = useMemo(() => {
    const branchRanks: Record<string, number[]> = {}
    filteredCutoffEntries.forEach(e => {
      if (e.closingRank && e.program) {
        const name = e.program
        if (!branchRanks[name]) branchRanks[name] = []
        branchRanks[name].push(e.closingRank)
      }
    })

    const hardnessMap = Object.entries(branchRanks).map(([name, ranks]) => {
      const sorted = [...ranks].sort((a, b) => a - b)
      const index = Math.max(0, Math.floor(sorted.length * 0.1))
      const eliteBarrier = sorted[index]
      return { name, avg: eliteBarrier, total: ranks.length }
    })
    .filter(b => b.total > 2)
    .sort((a, b) => a.avg - b.avg)

    return {
      labels: hardnessMap.map(h => h.name),
      datasets: [{
        label: `Elite Entry Barrier (${examFilter})`,
        data: hardnessMap.map(h => h.avg),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }],
      totalItems: hardnessMap.length
    }
  }, [filteredCutoffEntries, examFilter])

  // 6. Stream Availability
  const streamChartData = useMemo(() => {
    const programCollegeMap: Record<string, Set<string>> = {}
    cutoffDocs.forEach((doc, docIdx) => {
      if (doc.cutoffs && Array.isArray(doc.cutoffs)) {
        doc.cutoffs.forEach(entry => {
          if (entry.program) {
            const name = entry.program
            if (!programCollegeMap[name]) {
              programCollegeMap[name] = new Set()
            }
            programCollegeMap[name].add(String(docIdx))
          }
        })
      }
    })
    const top = Object.entries(programCollegeMap)
      .map(([name, colleges]) => ({ name, count: colleges.size }))
      .sort((a, b) => b.count - a.count).slice(0, 24)
    return {
      labels: top.map(t => t.name),
      datasets: [{
        data: top.map(t => t.count),
        backgroundColor: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#db2777', '#d97706', '#7dd3fc', '#86efac', '#fde047', '#c4b5fd', '#f9a8d4', '#fdba74', '#0f172a', '#14532d', '#713f12', '#4c1d95', '#831843', '#7c2d12'],
        borderWidth: 0,
      }]
    }
  }, [cutoffDocs])

  // 7. Generic Stats
  const typeChartData = useMemo(() => {
    const map: Record<string, number> = {}
    typeDocs.forEach(d => {
      const t = d.type || 'Other'
      map[t] = (map[t] || 0) + 1
    })
    return { labels: Object.keys(map), datasets: [{ data: Object.values(map), backgroundColor: ['#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#db2777', '#d97706', '#0f172a'], borderWidth: 0 }] }
  }, [typeDocs])

  const yearChartData = useMemo(() => {
    const map: Record<number, number> = {}
    allCutoffEntries.forEach(entry => { if (entry.year) map[entry.year] = (map[entry.year] || 0) + 1 })
    const sorted = Object.entries(map).sort(([a], [b]) => Number(a) - Number(b))
    return { labels: sorted.map(([y]) => y), datasets: [{ label: 'Records', data: sorted.map(([,c]) => c), backgroundColor: '#10b981', borderRadius: 4 }] }
  }, [allCutoffEntries])

  const feeChartData = useMemo(() => {
    const tiers = { 'Budget (<50k)': 0, 'Value (50k-2L)': 0, 'Mid (2L-5L)': 0, 'Premium (>5L)': 0, 'Not Specified': 0 }
    feeDocs.forEach(d => {
      const amt = d.feesStats?.totalCourseFeeAmount
      if (!amt || amt === 0) tiers['Not Specified']++
      else if (amt < 50000) tiers['Budget (<50k)']++
      else if (amt < 200000) tiers['Value (50k-2L)']++
      else if (amt < 500000) tiers['Mid (2L-5L)']++
      else tiers['Premium (>5L)']++
    })
    return { labels: Object.keys(tiers), datasets: [{ label: 'Colleges', data: Object.values(tiers), backgroundColor: '#ca8a04', borderRadius: 6 }] }
  }, [feeDocs])

  const stats = useMemo(() => ({
    totalEntries: allCutoffEntries.length,
    uniqueStreams: new Set(allCutoffEntries.map(e => e.program)).size,
    uniqueYears: new Set(allCutoffEntries.map(e => e.year)).size
  }), [allCutoffEntries])

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={36} color="#2563eb" /> Analytics Engine
          </h1>
          <p style={{ opacity: 0.6 }}>Mining system records for distribution patterns and data growth.</p>
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--theme-elevation-100)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid var(--theme-elevation-200)' }}>
          <button onClick={() => setExamFilter('WBJEE')} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', backgroundColor: examFilter === 'WBJEE' ? '#2563eb' : 'transparent', color: examFilter === 'WBJEE' ? '#fff' : 'var(--theme-text)', transition: 'all 0.2s' }}>WBJEE Ranks</button>
          <button onClick={() => setExamFilter('JEEM')} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', backgroundColor: examFilter === 'JEEM' ? '#2563eb' : 'transparent', color: examFilter === 'JEEM' ? '#fff' : 'var(--theme-text)', transition: 'all 0.2s' }}>JEE Main Ranks</button>
        </div>
      </header>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Colleges', value: totalColleges, icon: Database, color: '#2563eb' },
          { label: 'Data Points', value: stats.totalEntries.toLocaleString(), icon: Layers, color: '#10b981' },
          { label: 'Active Streams', value: stats.uniqueStreams, icon: TrendingUp, color: '#9333ea' },
          { label: 'Data Years', value: stats.uniqueYears, icon: Calendar, color: '#ca8a04' },
        ].map((kpi, i) => (
          <div key={i} style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: `${kpi.color}15`, padding: '0.75rem', borderRadius: '0.75rem' }}><kpi.icon size={24} color={kpi.color} /></div>
            <div><p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, opacity: 0.5 }}>{kpi.label}</p><p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{kpi.value}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendIcon size={20} color="#10b981" /> Program Adoption Growth</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {marketShift.map((shift, i) => (
              <div key={i} style={{ backgroundColor: 'var(--theme-elevation-100)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-200)', marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>{shift.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>+{shift.diff} Colleges</p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}><ArrowUpRight size={16} /> {Math.round(shift.pct)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={20} color="#f59e0b" /> Counseling Pressure ({examFilter})</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {cpiAnalysis.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
                <div style={{ width: '30px', fontWeight: 800, opacity: 0.3 }}>#{i+1}</div>
                <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>{Math.round(item.cpi)}%</span>
                  <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--theme-elevation-200)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ height: '100%', width: `${item.cpi}%`, backgroundColor: '#f59e0b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={20} color="#2563eb" /> Market Tier Consistency</h2>
          <div style={{ height: '300px' }}><Pie data={marketTiers} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChartIcon size={20} color="#2563eb" /> College Composition</h2>
          <div style={{ height: '300px' }}><Pie data={typeChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={20} color="#ca8a04" /> Affordability Segments</h2>
          <div style={{ height: '300px' }}><Bar data={feeChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="#10b981" /> Year-over-Year Data Growth</h2>
          <div style={{ height: '300px' }}><Bar data={yearChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RoiIcon size={20} color="#10b981" /> ROI Distribution Landscape</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem' }}>Correlation between Total Fees (X) and Avg Package (Y). Higher dots = Better ROI.</p>
          <div style={{ height: '400px' }}>
            <Scatter 
              data={roiAnalysis.scatterData} 
              options={{ 
                maintainAspectRatio: false, 
                scales: { x: { title: { display: true, text: 'Total Fees (INR)' } }, y: { title: { display: true, text: 'Avg Package (LPA)' } } }, 
                plugins: { 
                  tooltip: { 
                    callbacks: { 
                      label: (context: TooltipItem<'scatter'>) => {
                        const raw = context.raw as { name: string, roi: number };
                        return `${raw.name}: ROI ${raw.roi}`;
                      } 
                    } 
                  } 
                } 
              }} 
            />
          </div>
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ListIcon size={18} /> Full ROI Ledger</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--theme-elevation-200)', borderRadius: '0.75rem', backgroundColor: 'var(--theme-elevation-100)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--theme-elevation-200)' }}>
                  <tr><th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>College Name</th><th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>Total Fees</th><th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>Avg Package</th><th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#10b981' }}>ROI Score</th></tr>
                </thead>
                <tbody>
                  {roiAnalysis.sortedItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--theme-elevation-150)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{item.fees.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{item.pkg} LPA</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{item.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={20} color="#ef4444" /> Branch Competitiveness (Elite Entry Barrier - {examFilter})</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem' }}>Calculated using the 10th percentile rank. X-axis is Logarithmic to show elite rank gaps clearly.</p>
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem', border: '1px solid var(--theme-elevation-200)', borderRadius: '1rem', backgroundColor: 'var(--theme-elevation-100)', padding: '1.5rem' }}>
            <div style={{ height: `${branchHardness.totalItems * 40}px`, minHeight: '400px' }}>
              <Bar data={branchHardness} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { type: 'logarithmic', title: { display: true, text: 'Closing Rank (Log Scale)' }, reverse: true, grid: { color: 'rgba(255,255,255,0.05)' }, min: 10, max: Math.pow(10, Math.ceil(Math.log10(globalMaxRank || 1000000))), ticks: { callback: (value) => value.toLocaleString() } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } } }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--theme-elevation-150)', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={20} color="#1e293b" /> Stream Availability (Unique Colleges)</h2>
          <div style={{ height: '500px' }}><Pie data={streamChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, boxWidth: 12, font: { size: 11 } } } } }} /></div>
        </div>
      </div>
    </div>
  )
}
