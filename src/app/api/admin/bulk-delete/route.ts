import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const collection = searchParams.get('collection')

  if (!collection) {
    return NextResponse.json({ error: 'Collection is required' }, { status: 400 })
  }

  // Safety check
  if (collection === 'users') {
    return NextResponse.json({ error: 'Deleting all users via this tool is restricted.' }, { status: 403 })
  }

  try {
    // Perform bulk delete
    const result = await payload.delete({
      collection: collection as 'colleges', // Any valid collection works, colleges is just for type hint
      where: {
        id: {
          exists: true,
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: `Deleted documents in ${collection}`,
      result 
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[BulkDelete] Error for ${collection}:`, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
