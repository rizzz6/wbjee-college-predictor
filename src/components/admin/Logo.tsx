import React from 'react'
import Image from 'next/image'

export const Logo: React.FC = () => {
  return (
    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Image
        src="/assets/logo.svg"
        alt="rwbjee Logo"
        width={35}
        height={35}
        style={{ height: '35px', width: 'auto' }}
      />
      <span style={{ 
        fontWeight: 700, 
        fontSize: '1.5rem', 
        letterSpacing: '-0.02em', 
        color: 'var(--theme-text)',
        fontFamily: 'Inter, sans-serif'
      }}>
        rwbjee
      </span>
    </div>
  )
}
