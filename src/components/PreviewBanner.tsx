import React from 'react'
import { draftMode } from 'next/headers'
import Link from 'next/link'

export default async function PreviewBanner() {
  const { isEnabled } = await draftMode()

  if (!isEnabled) return null

  return (
    <div style={{
      backgroundColor: '#111827',
      color: '#fff',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      borderBottom: '1px solid #374151'
    }}>
      <span>You are viewing the site in Preview Mode (Drafts enabled)</span>
      <Link 
        href="/api/exit-preview" 
        style={{
          backgroundColor: '#ef4444',
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontSize: '0.75rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
      >
        Exit Preview
      </Link>
    </div>
  )
}
