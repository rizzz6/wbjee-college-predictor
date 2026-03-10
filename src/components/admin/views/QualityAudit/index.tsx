import React from 'react'
import { AdminViewProps } from 'payload'
import QualityAuditClient, { College } from '@/components/admin/views/QualityAudit/QualityAuditClient'
import { DefaultTemplate } from '@payloadcms/next/templates'

const QualityAuditView: React.FC<AdminViewProps> = async (props) => {
  const { payload } = props
  // Fetch all colleges to analyze health on the client side
  const colleges = await payload.find({
    collection: 'colleges',
    limit: 1000, // Assuming total colleges are within this range
    select: {
      name: true,
      logo: true,
      seoDescription: true,
      highlights: true,
    }
  })

  return (
    <DefaultTemplate 
      {...props} 
      visibleEntities={props.visibleEntities || { collections: [], globals: [] }}
    >
      <QualityAuditClient initialColleges={colleges.docs as unknown as College[]} />
    </DefaultTemplate>
  )
}

export default QualityAuditView
