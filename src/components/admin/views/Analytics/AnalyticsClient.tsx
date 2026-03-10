'use client'
import React from 'react'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  MapPin, 
  TrendingUp
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
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export interface TypeDoc {
  type: string
}

export interface LocationDoc {
  location: string
}

export default function AnalyticsClient({ 
  totalColleges, 
  typeDocs, 
  locationDocs 
}: { 
  totalColleges: number, 
  typeDocs: TypeDoc[], 
  locationDocs: LocationDoc[] 
}) {
  // Process types
  const typeMap: Record<string, number> = {}
  typeDocs.forEach(d => {
    const t = d.type || 'Other'
    typeMap[t] = (typeMap[t] || 0) + 1
  })

  // Process locations
  const locMap: Record<string, number> = {}
  locationDocs.forEach(d => {
    const l = d.location || 'Unknown'
    locMap[l] = (locMap[l] || 0) + 1
  })

  const topLocations = Object.entries(locMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)

  const typeChartData = {
    labels: Object.keys(typeMap),
    datasets: [{
      label: 'Colleges by Type',
      data: Object.values(typeMap),
      backgroundColor: [
        'rgba(37, 99, 235, 0.8)',
        'rgba(22, 163, 74, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(249, 115, 22, 0.8)',
      ],
      borderWidth: 0,
    }]
  }

  const locChartData = {
    labels: topLocations.map(([l]) => l),
    datasets: [{
      label: '# of Colleges',
      data: topLocations.map(([,c]) => c),
      backgroundColor: 'rgba(37, 99, 235, 0.6)',
      borderRadius: 8,
    }]
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart3 size={32} color="#2563eb" />
          Insight Analytics
        </h1>
        <p style={{ opacity: 0.6 }}>Detailed breakdown of college data distribution and composition.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Type Distribution */}
        <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PieChartIcon size={20} color="#2563eb" />
            College Type Distribution
          </h2>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={typeChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Location Breakdown */}
        <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={20} color="#2563eb" />
            Top Locations (Count)
          </h2>
          <div style={{ height: '300px' }}>
            <Bar data={locChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--theme-elevation-50, #fff)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)', textAlign: 'center' }}>
             <TrendingUp size={24} color="#2563eb" style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
             <p style={{ fontSize: '0.875rem', opacity: 0.5, margin: 0 }}>Total Records</p>
             <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>{totalColleges}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
