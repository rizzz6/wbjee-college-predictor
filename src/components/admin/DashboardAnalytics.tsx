import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { 
  School, 
  Eye, 
  EyeOff, 
  FileText, 
  Users,
  Database,
  Settings,
  Globe,
  Clock
} from 'lucide-react'

const DashboardAnalytics = async () => {
  const payload = await getPayload({ config })
  
  const [
    colleges,
    cutoffs,
    posts,
    _timeline,
    _media,
    users,
    visibleColleges
  ] = await Promise.all([
    payload.count({ collection: 'colleges' }),
    payload.count({ collection: 'college_cutoffs' }),
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'timeline' }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'colleges', where: { isVisible: { equals: true } } }),
  ])

  const recentColleges = await payload.find({
    collection: 'colleges',
    limit: 5,
    sort: '-updatedAt',
  })

  const invisibleColleges = colleges.totalDocs - (visibleColleges.totalDocs || 0)

  const stats = [
    { label: 'Total Colleges', count: colleges.totalDocs, color: '#3b82f6', icon: School, href: '/admin/collections/colleges' },
    { label: 'Visible Colleges', count: visibleColleges.totalDocs, color: '#10b981', icon: Eye, href: '/admin/collections/colleges?where[isVisible][equals]=true' },
    { label: 'Hidden Colleges', count: invisibleColleges, color: '#f59e0b', icon: EyeOff, href: '/admin/collections/colleges?where[isVisible][equals]=false' },
    { label: 'Cutoff Data', count: cutoffs.totalDocs, color: '#6366f1', icon: FileText, href: '/admin/collections/college_cutoffs' },
    { label: 'Blog Posts', count: posts.totalDocs, color: '#ec4899', icon: FileText, href: '/admin/collections/posts' },
    { label: 'Users', count: users.totalDocs, color: '#8b5cf6', icon: Users, href: '/admin/collections/users' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--theme-elevation-150)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Analytics Overview</h1>
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>Statistics and system status for WBJEE Predictor</p>
      </header>

      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '3rem' 
      }}>
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.label} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              backgroundColor: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1.5rem', 
                right: '1.5rem', 
                color: stat.color,
                opacity: 0.8
              }}>
                <stat.icon size={24} />
              </div>
              <h3 style={{ 
                fontSize: '0.875rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--theme-elevation-600)',
                margin: '0 0 0.5rem 0'
              }}>{stat.label}</h3>
              <div style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{stat.count}</div>
              <div style={{ 
                marginTop: '1rem', 
                height: '4px', 
                width: '100%', 
                backgroundColor: 'var(--theme-elevation-150)', 
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: stat.color, 
                  width: '65%',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                backgroundColor: 'var(--theme-elevation-100)', 
                borderRadius: '8px',
                border: '1px solid var(--theme-elevation-200)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--theme-text)',
                fontWeight: 600
              }}>
                <Globe size={20} />
                <span>Visit Live Website</span>
              </div>
            </Link>
            <Link href="/admin/data-management" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                backgroundColor: 'var(--theme-elevation-100)', 
                borderRadius: '8px',
                border: '1px solid var(--theme-elevation-200)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--theme-text)',
                fontWeight: 600
              }}>
                <Database size={20} />
                <span>Export/Import Management</span>
              </div>
            </Link>
            <Link href="/admin/operations" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                backgroundColor: 'var(--theme-elevation-100)', 
                borderRadius: '8px',
                border: '1px solid var(--theme-elevation-200)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--theme-text)',
                fontWeight: 600
              }}>
                <Settings size={20} />
                <span>System Operations</span>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <div style={{ 
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} />
              Recent Updates
            </h2>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {recentColleges.docs.map((doc: any) => (
                <Link key={doc.id} href={`/admin/collections/colleges/${doc.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>
                        Updated {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px' }}>
                      Edit
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/admin/collections/colleges" style={{ textDecoration: 'none' }}>
              <button style={{ 
                width: '100%', 
                marginTop: '1.5rem', 
                padding: '0.75rem', 
                backgroundColor: 'var(--theme-elevation-800)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                View All Colleges
              </button>
            </Link>
          </div>
        </section>
      </div>

      <footer style={{ 
        marginTop: '5rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid var(--theme-elevation-150)', 
        color: 'var(--theme-elevation-400)',
        fontSize: '0.85rem',
        textAlign: 'center'
      }}>
        © {new Date().getFullYear()} WBJEE Predictor Admin Panel • Build v1.4.1
      </footer>
    </div>
  )
}

export default DashboardAnalytics
