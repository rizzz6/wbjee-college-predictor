import React from 'react'
import { AdminViewProps } from 'payload'
import DataManagementClient from './DataManagementClient'
import { DefaultTemplate } from '@payloadcms/next/templates'

export default function DataManagementView(props: AdminViewProps) {
  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <DataManagementClient />
    </DefaultTemplate>
  )
}
