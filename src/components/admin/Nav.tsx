'use client'
import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  Settings,
  School,
  FileText,
  Calendar,
  Image as ImageIcon,
  Users,
  User,
  LogOut,
  Code,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'

const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ 
      fontSize: '0.7rem', 
      textTransform: 'uppercase', 
      letterSpacing: '0.1em',
      color: 'var(--theme-elevation-400)',
      marginBottom: '0.75rem',
      paddingLeft: '1rem',
      fontWeight: 700
    }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {children}
    </div>
  </div>
)

const NavLink = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
  const pathname = usePathname()
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <Link 
      href={href} 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        textDecoration: 'none',
        color: isActive ? 'var(--theme-text)' : 'var(--theme-elevation-600)',
        backgroundColor: isActive ? 'var(--theme-elevation-150)' : 'transparent',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
        <span>{label}</span>
      </div>
      {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
    </Link>
  )
}

const Nav = () => {
  const { user, logOut } = useAuth()
  const [isProfileHovered, setIsProfileHovered] = useState(false)
  const shouldShowGraphQLPlayground =
    process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_GRAPHQL_PLAYGROUND === 'true'

  return (
    <nav style={{ 
      padding: '1.5rem 0.75rem', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--theme-elevation-50)',
      borderRight: '1px solid var(--theme-elevation-150)',
      overflowY: 'auto'
    }}>
      
      <div style={{ padding: '0 0.5rem', marginBottom: '2.5rem' }}>
        <Logo />
      </div>
      
      <div style={{ flex: 1 }}>
        <NavGroup title="Monitoring">
          <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavLink href="/admin/analytics" icon={BarChart3} label="Insights" />
          <NavLink href="/admin/quality" icon={ShieldCheck} label="Audit Logs" />
        </NavGroup>

        <NavGroup title="Infrastructure">
          <NavLink href="/admin/data-management" icon={Database} label="Data Transfer" />
          <NavLink href="/admin/operations" icon={Settings} label="System Config" />
        </NavGroup>

        <NavGroup title="Repository">
          <NavLink href="/admin/collections/colleges" icon={School} label="Colleges" />
          <NavLink href="/admin/collections/college_cutoffs" icon={FileText} label="Cutoff Data" />
          <NavLink href="/admin/collections/posts" icon={FileText} label="Blog Editor" />
          <NavLink href="/admin/collections/timeline" icon={Calendar} label="Timeline" />
        </NavGroup>

        <NavGroup title="Administration">
          <NavLink href="/admin/collections/users" icon={Users} label="Team Members" />
          <NavLink href="/admin/collections/media" icon={ImageIcon} label="Media Library" />
          <NavLink href="/admin/globals/site-settings" icon={Settings} label="Site Settings" />
          {shouldShowGraphQLPlayground && (
            <NavLink href="/api/graphql-playground" icon={Code} label="GraphQL" />
          )}
        </NavGroup>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--theme-elevation-150)',
        position: 'relative' 
      }}>
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setIsProfileHovered(true)}
          onMouseLeave={() => setIsProfileHovered(false)}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: 'var(--theme-elevation-100)'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              backgroundColor: 'var(--theme-elevation-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap'
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          {isProfileHovered && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              width: '100%',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-200)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '0.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              zIndex: 100,
            }}>
              <Link 
                href="/admin/account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.85rem',
                  borderRadius: '4px'
                }}
              >
                <User size={14} />
                <span>Account</span>
              </Link>
              <button 
                onClick={() => logOut()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '4px'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Nav
