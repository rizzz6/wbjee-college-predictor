import React from 'react'
import { AdminViewProps } from 'payload'
import AccountClient from './AccountClient'

const AccountView: React.FC<AdminViewProps> = async () => {
  return (
    <AccountClient />
  )
}

export default AccountView
