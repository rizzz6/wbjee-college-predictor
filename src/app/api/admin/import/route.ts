import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utils/logger'

import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { collection, data } = await req.json()

    if (!collection || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Collection and an array of data are required' }, { status: 400 })
    }

    logger.info(`[Import] Starting import of ${data.length} items into ${collection}`)

    const results = []
    const errors = []

    // Sequential import to avoid overwhelming the database/pool
    for (const item of data as Array<Record<string, unknown>>) {
      try {
        // Strip out metadata fields that shouldn't be set during import
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanItem } = item as Record<string, unknown>
        
        await payload.create({
          collection: collection as 'colleges',
          data: cleanItem as never,
        })
        results.push(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ id: (item.id as string) || 'unknown', error: message })
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      failed: errors.length,
      errors: errors.slice(0, 10) // Only return first 10 errors to keep response size sane
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Import] Global error:`, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
