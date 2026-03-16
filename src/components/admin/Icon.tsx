import React from 'react'
import Image from 'next/image'

export const Icon: React.FC = () => {
  return (
    <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src="/assets/logo.svg"
        alt="rwbjee Icon"
        width={24}
        height={24}
        style={{ height: '24px', width: 'auto' }}
      />
    </div>
  )
}
