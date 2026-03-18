import React from 'react'
import { AdminViewProps } from 'payload'
import QualityAuditClient, { College, MediaItem, PlacementReport } from '@/components/admin/views/QualityAudit/QualityAuditClient'
import { DefaultTemplate } from '@payloadcms/next/templates'

const QualityAuditView: React.FC<AdminViewProps> = async (props) => {
  const { payload } = props

  // 1. Fetch all colleges with relevant fields for audit
  const collegesRes = await payload.find({
    collection: 'colleges',
    limit: 1000,
    select: {
      name: true,
      slug: true,
      logo: true,
      coverImage: true,
      website: true,
      seoDescription: true,
      highlights: true,
      overview: true,
      feesStats: true,
      rankingHistory: true,
      isVisible: true,
      cutoffSourceName: true,
    }
  })

  // 2. Fetch media items to check file sizes
  const mediaRes = await payload.find({
    collection: 'media',
    limit: 1000,
    select: {
      id: true,
      filesize: true,
      filename: true,
    }
  })

  // 3. Get cutoff counts and placement reliability
  const placementRes = await payload.find({
    collection: 'college_placement_reports',
    limit: 1000,
    select: {
      college: true,
      sourceReliability: true,
    }
  })

  // 4. Get total cutoff docs
  const cutoffsRes = await payload.find({
    collection: 'college_cutoffs',
    limit: 1, 
  })

  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <QualityAuditClient 
        initialColleges={collegesRes.docs as unknown as College[]} 
        mediaItems={mediaRes.docs as unknown as MediaItem[]}
        placementReports={placementRes.docs as unknown as PlacementReport[]}
        _hasAnyCutoffs={cutoffsRes.totalDocs > 0}
      />
    </DefaultTemplate>
  )
}

export default QualityAuditView
