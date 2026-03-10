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
  Globe
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
    { label: 'Total Colleges', count: colleges.totalDocs, color: 'var(--ghibli-sky)', bgHover: 'rgba(135, 206, 235, 0.15)', icon: School, href: '/admin/collections/colleges' },
    { label: 'Visible Colleges', count: visibleColleges.totalDocs, color: 'var(--ghibli-forest)', bgHover: 'rgba(45, 90, 39, 0.15)', icon: Eye, href: '/admin/collections/colleges?where[isVisible][equals]=true' },
    { label: 'Hidden Colleges', count: invisibleColleges, color: 'var(--ghibli-earth)', bgHover: 'rgba(230, 126, 34, 0.15)', icon: EyeOff, href: '/admin/collections/colleges?where[isVisible][equals]=false' },
    { label: 'Cutoff Data', count: cutoffs.totalDocs, color: 'var(--ghibli-sky)', bgHover: 'rgba(135, 206, 235, 0.15)', icon: FileText, href: '/admin/collections/college_cutoffs' },
    { label: 'Blog Posts', count: posts.totalDocs, color: 'var(--ghibli-earth)', bgHover: 'rgba(230, 126, 34, 0.15)', icon: FileText, href: '/admin/collections/posts' },
    { label: 'Users', count: users.totalDocs, color: 'var(--ghibli-forest)', bgHover: 'rgba(45, 90, 39, 0.15)', icon: Users, href: '/admin/collections/users' },
  ]

  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div className="journal-page deckled-edge">
          {/* Header */}
          <header className="g-flex g-flex-col md:g-flex-row g-justify-between g-items-center g-mb-12 g-border-b-2 g-border-gray-400" style={{ borderBottomStyle: 'dotted', paddingBottom: '1.5rem' }}>
            <div>
              <h1 className="g-text-5xl g-font-bold" style={{ color: '#2D5A27', fontFamily: "'Nanum Pen Script', cursive" }}>Analytics Overview</h1>
              <p className="g-text-sm g-italic g-text-gray-500">Dashboard &amp; Statistics • {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          {/* Stats Grid */}
          <section className="g-grid g-grid-cols-1 md:g-grid-cols-3 g-gap-8 g-mb-12">
            {stats.map((stat) => (
              <Link href={stat.href} key={stat.label} className="g-text-decoration-none" style={{ color: 'inherit' }}>
                <div 
                  className="hand-drawn-border g-p-6 g-transition-colors hover-card" 
                  style={{ backgroundColor: 'var(--paper-base)', position: 'relative', '--bg-hover': stat.bgHover } as React.CSSProperties}
                >
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', opacity: 0.6, color: stat.color }}>
                    <stat.icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="g-text-xl g-font-semibold" style={{ color: stat.color }}>{stat.label}</h3>
                  <div className="g-flex g-items-center g-gap-4" style={{ marginTop: '0.5rem' }}>
                    <span className="g-text-4xl g-font-bold" style={{ color: 'var(--theme-text)' }}>{stat.count}</span>
                  </div>
                  <div style={{ marginTop: '1rem', height: '0.25rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '0.25rem' }}>
                    <div style={{ height: '0.25rem', backgroundColor: stat.color, borderRadius: '0.25rem', width: '70%', opacity: 0.8 }}></div>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {/* Two-column layout for Activity and Inventory */}
          <div className="g-grid g-grid-cols-1 md:g-grid-cols-3 g-gap-8">
            
            {/* Quick Actions (Replacing the Chart Area) */}
            <section className="g-border-b g-border-gray-200" style={{ gridColumn: 'span 2' }}>
               <h2 className="g-text-2xl g-font-bold g-mb-6" style={{ textDecoration: 'underline wavy #87CEEB', color: 'var(--ghibli-forest)' }}>Quick Actions</h2>
               <div className="g-grid g-grid-cols-1 g-gap-6 md:g-grid-cols-2">
                 <Link href="/" target="_blank" className="g-text-decoration-none">
                    <div className="hand-drawn-border g-p-6 btn-watercolor g-flex g-items-center g-justify-center g-gap-3" style={{ backgroundColor: 'rgba(135, 206, 235, 0.1)', color: 'var(--ghibli-forest)' }}>
                      <Globe size={20} />
                      <span className="g-text-xl g-font-bold">View Live Website</span>
                    </div>
                 </Link>
                 <Link href="/admin/data-management" className="g-text-decoration-none">
                    <div className="hand-drawn-border g-p-6 btn-watercolor g-flex g-items-center g-justify-center g-gap-3" style={{ backgroundColor: 'rgba(45, 90, 39, 0.1)', color: 'var(--ghibli-sky)' }}>
                      <Database size={20} />
                      <span className="g-text-xl g-font-bold">Data Management</span>
                    </div>
                 </Link>
                 <Link href="/admin/operations" className="g-text-decoration-none" style={{ gridColumn: 'span 2' }}>
                    <div className="hand-drawn-border g-p-6 btn-watercolor g-flex g-items-center g-justify-center g-gap-3" style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: 'var(--ghibli-earth)' }}>
                      <Settings size={20} />
                      <span className="g-text-xl g-font-bold">System Operations</span>
                    </div>
                 </Link>
               </div>
               
               {/* Quick Info Box in place of table */}
               <div className="hand-drawn-border g-p-6" style={{ marginTop: '2rem', backgroundColor: 'var(--paper-base)', borderStyle: 'dotted' }}>
                  <h2 className="g-text-2xl g-font-bold g-mb-4" style={{ textDecoration: 'underline wavy var(--ghibli-forest)', color: 'var(--ghibli-forest)' }}>Current Scope</h2>
                  <p className="g-italic g-text-gray-500" style={{ color: 'var(--secondary-text)' }}>
                    The platform contains <strong style={{ color: 'var(--ghibli-sky)' }}>{colleges.totalDocs}</strong> colleges across the state. <strong style={{ color: 'var(--ghibli-forest)' }}>{visibleColleges.totalDocs}</strong> are currently visible to users. There are <strong style={{ color: 'var(--ghibli-earth)' }}>{cutoffs.totalDocs}</strong> cutoff data points stored.
                  </p>
               </div>
            </section>

            {/* Recent Activity Sidebar */}
            <aside className="hand-drawn-border g-p-6" style={{ backgroundColor: 'var(--paper-base)' }}>
              <h2 className="g-text-2xl g-font-bold g-mb-6 g-border-b g-border-gray-200" style={{ paddingBottom: '0.5rem', color: 'var(--ghibli-forest)' }}>Recent Updates</h2>
              <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0 }}>
                {recentColleges.docs.map((doc: unknown, i: number) => {
                  const college = doc as { id: string | number; name: string; updatedAt: string };
                  return (
                    <li key={college.id} className="g-flex g-gap-4">
                      <span style={{ width: '0.5rem', height: '0.5rem', marginTop: '0.5rem', borderRadius: '9999px', backgroundColor: i % 2 === 0 ? 'var(--ghibli-sky)' : 'var(--ghibli-forest)', flexShrink: 0, display: 'inline-block' }}></span>
                      <div>
                        <Link href={`/admin/collections/colleges/${college.id}`} className="g-text-decoration-none" style={{ color: 'inherit' }}>
                          <p className="g-text-sm g-font-bold" style={{ margin: 0, color: 'var(--theme-text)' }}>{college.name}</p>
                        </Link>
                        <p className="g-text-xs g-text-gray-500" style={{ margin: 0, marginTop: '0.25rem', color: 'var(--secondary-text)' }}>Updated {new Date(college.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <Link href="/admin/collections/colleges" className="g-text-decoration-none">
                <button className="g-w-full btn-watercolor g-font-bold" style={{ marginTop: '2rem', padding: '0.5rem 0', backgroundColor: 'var(--desk-bg)', color: 'var(--theme-text)', cursor: 'pointer', border: '2px solid var(--glow-silver)' }}>
                  View All Colleges
                </button>
              </Link>
            </aside>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: 'var(--dotted-border)', display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-text)', fontStyle: 'italic', fontSize: '0.875rem' }}>
            <p>© {new Date().getFullYear()} WBJEE Predictor Admin Panel</p>
          </footer>
        </div>
    </div>
  )
}

export default DashboardAnalytics
