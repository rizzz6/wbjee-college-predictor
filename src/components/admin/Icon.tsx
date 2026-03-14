import React from 'react'

export const Icon: React.FC = () => {
  return (
    <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src="/assets/logo.svg"
        alt="rwbjee Icon"
        width={24}
        height={24}
        style={{ height: '24px', width: 'auto' }}
      />
    </div>
  )
}
