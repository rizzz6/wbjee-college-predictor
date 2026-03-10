import React from 'react'
import OperationsClient from './OperationsClient'
import { AdminViewProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'

export default async function OperationsView(props: AdminViewProps) {
  const { payload } = props
  // Fetch deploy hooks from globals
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  })

  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <OperationsClient deployHooks={(settings?.deployHooks as unknown[]) as { name: string, url: string }[] || []} />
    </DefaultTemplate>
  )
}
