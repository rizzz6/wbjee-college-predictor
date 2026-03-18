import React from 'react'
import { AdminViewProps } from 'payload'
import AnalyticsClient, { TypeDoc, CutoffDoc, FeeDoc, PlacementDoc } from '@/components/admin/views/Analytics/AnalyticsClient'
import { DefaultTemplate } from '@payloadcms/next/templates'

const AnalyticsView: React.FC<AdminViewProps> = async (props) => {
  const { payload } = props
  const [colleges, typeStats, feeStats, cutoffData, placementReports] = await Promise.all([
    payload.find({ collection: 'colleges', limit: 0 }),
    payload.find({ collection: 'colleges', limit: 1000, select: { type: true } }),
    payload.find({ collection: 'colleges', limit: 1000, select: { name: true, feesStats: true } }),
    payload.find({ 
      collection: 'college_cutoffs', 
      limit: 1000, 
      select: { 
        institute: true,
        college: true,
        cutoffs: true 
      } 
    }),
    payload.find({
      collection: 'college_placement_reports',
      limit: 1000,
      select: {
        college: true,
        averagePackageLpa: true,
      }
    })
  ])

  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <AnalyticsClient 
        totalColleges={colleges.totalDocs}
        typeDocs={typeStats.docs as unknown as TypeDoc[]}
        feeDocs={feeStats.docs as unknown as FeeDoc[]}
        cutoffDocs={cutoffData.docs as unknown as CutoffDoc[]}
        placementDocs={placementReports.docs as unknown as PlacementDoc[]}
      />
    </DefaultTemplate>
  )
}

export default AnalyticsView
