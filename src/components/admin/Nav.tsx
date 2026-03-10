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
  Code
} from 'lucide-react'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'

const TAB_STYLES = [
  {
    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M10,20 Q50,15 90,25 T180,20' stroke='%23aedff7' stroke-width='12' fill='none' opacity='0.6' filter='url(%23blur)'/%3E%3Cpath d='M20,35 Q60,45 110,30 T190,40' stroke='%2387CEEB' stroke-width='14' fill='none' opacity='0.5' filter='url(%23blur)'/%3E%3Cpath d='M5,45 Q80,35 150,50' stroke='%235D8AA8' stroke-width='10' fill='none' opacity='0.4' filter='url(%23blur)'/%3E%3C/svg%3E"), #87CEEB`,
    border: '#5D8AA8',
    rotate: '-2deg',
    radius: '255px 15px 225px 15px/15px 225px 15px 255px'
  },
  {
    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='1.8'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M5,25 Q90,10 185,30' stroke='%23ff9e4a' stroke-width='15' fill='none' opacity='0.6' filter='url(%23blur)'/%3E%3Cpath d='M15,40 Q100,50 190,35' stroke='%23E67E22' stroke-width='12' fill='none' opacity='0.5' filter='url(%23blur)'/%3E%3Cpath d='M30,15 Q70,45 160,20' stroke='%23A0522D' stroke-width='8' fill='none' opacity='0.4' filter='url(%23blur)'/%3E%3C/svg%3E"), #E67E22`,
    border: '#A0522D',
    rotate: '1deg',
    radius: '15px 225px 15px 255px/255px 15px 225px 15px'
  },
  {
    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='1.4'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M0,30 Q100,20 200,30' stroke='%234a8241' stroke-width='18' fill='none' opacity='0.6' filter='url(%23blur)'/%3E%3Cpath d='M10,15 Q90,40 180,10' stroke='%232D5A27' stroke-width='14' fill='none' opacity='0.5' filter='url(%23blur)'/%3E%3Cpath d='M20,50 Q110,45 190,55' stroke='%231B3F18' stroke-width='10' fill='none' opacity='0.4' filter='url(%23blur)'/%3E%3C/svg%3E"), #2D5A27`,
    border: '#1B3F18',
    rotate: '-1.5deg',
    radius: '225px 15px 255px 15px/15px 255px 15px 225px'
  },
  {
    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='1.6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M5,15 C50,40 150,10 195,25' stroke='%23e6d5e6' stroke-width='16' fill='none' opacity='0.7' filter='url(%23blur)'/%3E%3Cpath d='M15,45 C80,20 120,55 185,35' stroke='%23D8BFD8' stroke-width='14' fill='none' opacity='0.5' filter='url(%23blur)'/%3E%3Cpath d='M10,30 Q100,35 190,30' stroke='%239370DB' stroke-width='10' fill='none' opacity='0.4' filter='url(%23blur)'/%3E%3C/svg%3E"), #D8BFD8`,
    border: '#9370DB',
    rotate: '2deg',
    radius: '15px 255px 15px 225px/225px 15px 255px 15px'
  }
];

const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column' }}>
    <h3 style={{ 
      fontSize: '1.2rem', 
      fontFamily: "'Nanum Pen Script', cursive",
      color: '#5d5d5d',
      marginBottom: '0.75rem',
      paddingLeft: '1.5rem',
      textDecoration: 'underline wavy #d1d5db',
      alignSelf: 'flex-start'
    }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', width: '100%' }}>
      {children}
    </div>
  </div>
)

const NavLink = ({ href, icon: Icon, label, index }: { href: string, icon: React.ElementType, label: string, index: number }) => {
  const pathname = usePathname()
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const styleContext = TAB_STYLES[index % TAB_STYLES.length];

  return (
    <Link 
      href={href} 
      className="bookmark-tab"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1.5rem 0.5rem 1rem', // Space on right to slip under
        textDecoration: 'none',
        color: '#fff',
        background: styleContext.background,
        backgroundBlendMode: 'multiply',
        backgroundSize: 'cover',
        borderTop: '2px solid',
        borderBottom: '2px solid',
        borderLeft: '2px solid',
        borderRight: 'none',
        borderColor: styleContext.border,
        borderRadius: styleContext.radius,
        boxShadow: isActive ? '-4px 4px 0 rgba(0,0,0,0.15)' : '-2px 2px 0 rgba(0,0,0,0.1)',
        fontSize: '1.05rem',
        fontWeight: 'bold',
        opacity: isActive ? 1 : 0.85,
        width: 'max-content',
        position: 'relative',
        marginRight: '-14px', // Slightly deeper overlap
        zIndex: isActive ? '99999 !important' : 'auto', 
        transform: isActive ? `rotate(${styleContext.rotate}) translateX(12px)` : `rotate(${styleContext.rotate})`,
      }}
    >
      <Icon size={18} style={{ opacity: isActive ? 1 : 0.8 }} />
      <span>{label}</span>
    </Link>
  )
}

const Nav = () => {
  const { user, logOut } = useAuth()
  const [isProfileHovered, setIsProfileHovered] = useState(false)

  let linkIndex = 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Nanum+Pen+Script&display=swap');

        /* Global Theme Overrides for Payload UI */
        :root, html[data-theme='light'] {
          --ghibli-sky: #87CEEB;
          --ghibli-forest: #2D5A27;
          --ghibli-earth: #E67E22;
          
          /* Ambient Variables */
          --desk-bg: #f0ede4;
          --paper-base: #fdfaf0;
          --theme-text: #4a4a4a;
          --secondary-text: #5d5d5d;
          
          /* Decor & FX */
          --glow-silver: #5d5d5d;
          --lantern-glow: 4px 4px 0 rgba(0, 0, 0, 0.05);
          --paper-border: 1px solid rgba(0,0,0,0.08);
          --main-shadow: 0 15px 40px rgba(0, 0, 0, 0.08), inset 0 0 80px rgba(255,255,255,0.5);
          --dotted-border: 2px dotted #d1d5db;
          
          /* Paper SVG Data */
          --paper-bg-filters: 
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperFibers'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperFibers)' opacity='0.4'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.05'/%3E%3C/svg%3E");
            
          /* Payload Native Overrides */
          --theme-bg: var(--desk-bg) !important;
          --theme-elevation-50: var(--paper-base) !important;
          --theme-elevation-100: var(--desk-bg) !important;
          --theme-elevation-150: #e6e2d3 !important;
          --theme-elevation-200: #d1d5db !important;
        }

        html[data-theme='dark'] {
          --ghibli-sky: #4A90E2;
          --ghibli-forest: #3CB371;
          --ghibli-earth: #FFD700;
          
          /* Ambient Variables */
          --desk-bg: #0f101a;
          --paper-base: #1a1b2e;
          --theme-text: #e2e8f0;
          --secondary-text: #94a3b8;
          
          /* Decor & FX */
          --glow-silver: rgba(209, 213, 219, 0.6);
          --lantern-glow: 0 0 20px rgba(255, 223, 186, 0.1);
          --paper-border: 1px solid rgba(255,255,255,0.1);
          --main-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), inset 0 0 120px rgba(0,0,0,0.6);
          --dotted-border: 2px dotted #475569;
          
          /* Dark Paper SVG Data */
          --paper-bg-filters: 
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperFibers'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%231a1b2e' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperFibers)' opacity='0.7'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.1'/%3E%3C/svg%3E");
            
          /* Payload Native Overrides */
          --theme-bg: var(--desk-bg) !important;
          --theme-elevation-50: var(--paper-base) !important;
          --theme-elevation-100: var(--desk-bg) !important;
          --theme-elevation-150: #1e293b !important;
          --theme-elevation-200: #334155 !important;
        }

        body, .payload__app {
          font-family: "Kalam", cursive !important;
          background-color: var(--desk-bg) !important; /* Flat desk color */
          color: var(--theme-text) !important;
        }

        /* Real Journal Page Layering */
        #nav, .nav, aside {
          z-index: auto !important; /* Allow bookmarks to stack relative to main */
          border-right: none !important;
          background: transparent !important;
          padding-top: 1rem !important;
        }

        /* The Journal Page - base z-index set to 10 */
        .template-default__wrap {
          z-index: 10 !important;
          position: relative !important;
          background-color: var(--paper-base) !important;
          background-image: var(--paper-bg-filters) !important;
          box-shadow: var(--main-shadow) !important;
          border-radius: 16px !important;
          border: var(--paper-border) !important;
          margin: 1.5rem 1.5rem 1.5rem 0 !important;
          min-height: calc(100vh - 3rem) !important;
          padding: 2rem !important;
          isolation: auto !important; /* Don't force isolation here either */
        }

        /* Outer containers must be transparent and MUST NOT have transforms or contexts */
        #main, .payload__main, .template-default__main, .payload__template, .template-default, #nav, .nav {
           background-color: transparent !important;
           padding: 0 !important;
           margin: 0 !important;
           background-image: none !important;
           z-index: auto !important;
           transform: none !important; 
           filter: none !important;
           overflow: visible !important; 
           isolation: auto !important;
        }

        /* Standardize buttons and cards across Payload */
        .card, .payload__list-view, .field-type:not(.group-field) {
          border: 2px solid var(--glow-silver) !important;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px !important;
          background-color: var(--paper-base) !important;
          box-shadow: var(--lantern-glow) !important;
          margin-bottom: 1.5rem !important;
          padding: 1.5rem !important;
        }

        /* Enhanced Table Styling - "Old Journal Table" */
        .table, .table-wrap, .payload__list-view__table {
          border: 2px solid var(--glow-silver) !important;
          background-color: var(--paper-base) !important;
          background-image: linear-gradient(rgba(235, 230, 210, 0.5), rgba(235, 230, 210, 0.5)), var(--paper-bg-filters) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
          overflow: hidden !important;
          margin: 1rem 0 !important;
        }
        
        .table thead th {
          background-color: rgba(0,0,0,0.07) !important;
          border-bottom: 2px solid var(--glow-silver) !important;
          color: var(--secondary-text) !important;
          font-weight: bold !important;
        }
        
        /* Ensure specific edit view wrappers don't get the giant rectangle */
        .collection-edit__main-wrapper, 
        .global-edit__main-wrapper, 
        .form, 
        .global-edit, 
        .collection-edit, 
        .group-field--top-level,
        .field-type.group,
        .field-type.group-field,
        .field-type.group-field--top-level,
        .group-field {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        h1, h2, h3, .payload__page-header h1 {
          font-family: 'Nanum Pen Script', cursive !important;
          color: var(--ghibli-forest) !important;
        }

        .bookmark-tab {
          transition: transform 0.2s, filter 0.2s;
        }
        .bookmark-tab:hover {
          filter: brightness(0.95);
        }
        /* Increase translate exclusively on hover via inline style logic or general hover */
        .bookmark-tab:not([style*="translateX(12px)"]):hover {
          transform: translateX(6px) !important;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #c2bfa7;
          border-radius: 10px;
        }

        /* Stitch Utility Classes */
        .hand-drawn-border {
          border: 2px solid var(--glow-silver);
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
          box-shadow: var(--lantern-glow);
        }

        .btn-watercolor {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 2px solid var(--glow-silver);
          border-radius: 50% 20% 50% 20%/20% 50% 20% 50%;
        }

        .btn-watercolor:hover {
          transform: scale(1.02) rotate(-1deg);
        }

        .hover-card:hover {
          background-color: var(--bg-hover) !important;
        }
        
        .g-flex { display: flex; }
        .g-flex-col { flex-direction: column; }
        .g-items-center { align-items: center; }
        .g-justify-between { justify-content: space-between; }
        .g-gap-4 { gap: 1rem; }
        .g-gap-6 { gap: 1.5rem; }
        .g-gap-8 { gap: 2rem; }
        .g-grid { display: grid; }
        .g-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\\:g-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:g-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .md\\:g-flex-row { flex-direction: row; }
        }
        .g-p-6 { padding: 1.5rem; }
        .g-mb-12 { margin-bottom: 3rem; }
        .g-mb-6 { margin-bottom: 1.5rem; }
        .g-text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .g-text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .g-text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .g-text-5xl { font-size: 3rem; line-height: 1; }
        .g-font-bold { font-weight: 700; }
        .g-font-semibold { font-weight: 600; }
        .g-block { display: block; }
        .g-text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .g-italic { font-style: italic; }
        .g-text-gray-500 { color: #6b7280; }
        .g-text-gray-400 { color: #9ca3af; }
        .g-text-white { color: #fff; }
        .g-bg-white-50 { background-color: rgba(255, 255, 255, 0.5); }
        .g-w-full { width: 100%; }
        .g-text-left { text-align: left; }
        .g-border-collapse { border-collapse: collapse; }
        .g-border-b-2 { border-bottom-width: 2px; }
        .g-border-b { border-bottom-width: 1px; }
        .g-border-slate-700 { border-color: #334155; }
        .g-border-gray-200 { border-color: #e5e7eb; }
        .g-py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .g-py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .g-px-4 { padding-left: 1rem; padding-right: 1rem; }
        .g-transition-colors { transition-property: background-color, border-color, color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .g-text-decoration-none { text-decoration: none; }
      `}} />
      <nav style={{ padding: '1.5rem 0 1.5rem 0', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
        
        <div style={{ padding: '0 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <Logo />
        </div>
        
        <NavGroup title="Dashboard">
          <NavLink href="/admin" icon={LayoutDashboard} label="Overview" index={linkIndex++} />
          <NavLink href="/admin/analytics" icon={BarChart3} label="Analytics" index={linkIndex++} />
          <NavLink href="/admin/quality" icon={ShieldCheck} label="Audit" index={linkIndex++} />
        </NavGroup>

        <NavGroup title="Data Management">
          <NavLink href="/admin/data-management" icon={Database} label="Tools" index={linkIndex++} />
          <NavLink href="/admin/operations" icon={Settings} label="Operations" index={linkIndex++} />
        </NavGroup>

        <NavGroup title="Content Inventory">
          <NavLink href="/admin/collections/colleges" icon={School} label="Colleges" index={linkIndex++} />
          <NavLink href="/admin/collections/college_cutoffs" icon={FileText} label="Cutoffs" index={linkIndex++} />
          <NavLink href="/admin/collections/posts" icon={FileText} label="Posts" index={linkIndex++} />
          <NavLink href="/admin/collections/timeline" icon={Calendar} label="Timeline" index={linkIndex++} />
        </NavGroup>

        <NavGroup title="System">
          <NavLink href="/admin/collections/users" icon={Users} label="Users" index={linkIndex++} />
          <NavLink href="/admin/collections/media" icon={ImageIcon} label="Media" index={linkIndex++} />
          <NavLink href="/admin/globals/site-settings" icon={Settings} label="Global Info" index={linkIndex++} />
          <NavLink href="/api/graphql-playground" icon={Code} label="GraphQL API" index={linkIndex++} />
        </NavGroup>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: 'var(--dotted-border)', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative' }}>
          <div 
            className="profile-container" 
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              border: '2px solid var(--glow-silver)',
              boxShadow: 'var(--lantern-glow)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              backgroundColor: 'var(--paper-base)'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                border: '2px solid var(--ghibli-forest)',
                backgroundColor: 'var(--desk-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ghibli-forest)'
              }}>
                <User size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontFamily: 'sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--theme-text)' }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="profile-dropdown" style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              width: '100%',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--paper-base)',
              border: '2px solid var(--glow-silver)',
              boxShadow: 'var(--main-shadow)',
              borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px',
              padding: '0.5rem',
              display: isProfileHovered ? 'flex' : 'none',
              flexDirection: 'column',
              gap: '0.25rem',
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
                  fontFamily: 'sans-serif',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={16} />
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
                  color: '#e63946',
                  fontFamily: 'sans-serif',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

      </nav>
    </>
  )
}

export default Nav
