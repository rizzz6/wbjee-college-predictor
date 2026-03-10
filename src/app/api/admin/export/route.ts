import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  
  // Use headers to check the user session
  const { user } = (await payload.auth({ headers: await getHeaders() })) as { user: { role: string } | null }

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const collection = searchParams.get('collection')

  if (!collection) {
    return NextResponse.json({ error: 'Collection is required' }, { status: 400 })
  }

  try {
    const data = await payload.find({
      collection: collection as 'colleges',
      limit: 10000, 
      pagination: false,
      depth: 0, 
    })

    return NextResponse.json(data.docs, {
      headers: {
        'Content-Disposition': `attachment; filename="${collection}-export.json"`,
        'Content-Type': 'application/json',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
