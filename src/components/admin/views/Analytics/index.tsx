import React from 'react'
import { AdminViewProps } from 'payload'
import AnalyticsClient, { TypeDoc, LocationDoc } from '@/components/admin/views/Analytics/AnalyticsClient'
import { DefaultTemplate } from '@payloadcms/next/templates'

const AnalyticsView: React.FC<AdminViewProps> = async (props) => {
  const { payload } = props
  const [colleges, typeStats, locationStats] = await Promise.all([
    payload.find({ collection: 'colleges', limit: 0 }), // count total
    payload.find({ collection: 'colleges', limit: 1000, select: { type: true } }),
    payload.find({ collection: 'colleges', limit: 1000, select: { location: true } }),
  ])

  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <AnalyticsClient 
        totalColleges={colleges.totalDocs}
        typeDocs={typeStats.docs as unknown as TypeDoc[]}
        locationDocs={locationStats.docs as unknown as LocationDoc[]}
      />
    </DefaultTemplate>
  )
}

export default AnalyticsView
