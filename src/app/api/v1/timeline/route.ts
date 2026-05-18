import { getPayloadClient } from '@/lib/payload-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'timeline',
      sort: 'date',
      limit: 100,
      pagination: false,
    })

    const events = res.docs.map(doc => ({
      _id: String(doc.id),
      title: doc.title,
      date: doc.date,
      isTentative: doc.isTentative || false,
    }))

    return NextResponse.json(events, {
      headers: {
        // Edge cache: 1 day. stale-while-revalidate: 1 hour
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      }
    })
  } catch (error) {
    console.error('Timeline API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
