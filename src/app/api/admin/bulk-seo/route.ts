import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const colleges = await payload.find({
      collection: 'colleges',
      where: {
        or: [
          { seoDescription: { exists: false } },
          { seoDescription: { equals: '' } }
        ]
      },
      limit: 1000
    })

    let count = 0
    for (const college of colleges.docs) {
      const seoDescription = `${college.name} - best ${college.type || 'College'} in ${college.location || 'West Bengal'}`
      await payload.update({
        collection: 'colleges',
        id: college.id,
        data: {
          seoDescription
        }
      })
      count++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated SEO for ${count} colleges.`,
      count 
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[BulkSEO] Error:`, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
