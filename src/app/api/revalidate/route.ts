import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Secret token to prevent unauthorized revalidation requests
const SANITY_REVALIDATE_TOKEN = process.env.SANITY_REVALIDATE_TOKEN

/**
 * Webhook endpoint for on-demand revalidation
 * Triggered by Sanity when content is published/unpublished
 * 
 * Usage: POST /api/revalidate?token=SECRET_TOKEN
 * Body: Sanity webhook payload
 */
export async function POST(request: NextRequest) {
    // ═══════════════════════════════════════════════════════════
    // EDGE CASE 1: Missing or invalid authentication token
    // ═══════════════════════════════════════════════════════════
    const token = request.nextUrl.searchParams.get('token')

    if (!SANITY_REVALIDATE_TOKEN) {
        console.error('[Revalidate] SANITY_REVALIDATE_TOKEN environment variable not set')
        return NextResponse.json({
            success: false,
            error: 'Server configuration error',
            message: 'Revalidation token not configured'
        }, { status: 500 })
    }

    if (!token || token !== SANITY_REVALIDATE_TOKEN) {
        console.warn('[Revalidate] Invalid token attempt:', {
            hasToken: !!token,
            timestamp: new Date().toISOString()
        })
        return NextResponse.json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or missing revalidation token'
        }, { status: 401 })
    }

    try {
        // ═══════════════════════════════════════════════════════════
        // EDGE CASE 2: Invalid or empty request body
        // ═══════════════════════════════════════════════════════════
        let body
        try {
            body = await request.json()
        } catch (parseError) {
            console.error('[Revalidate] Failed to parse request body:', parseError)
            return NextResponse.json({
                success: false,
                error: 'Invalid request',
                message: 'Request body must be valid JSON'
            }, { status: 400 })
        }

        if (!body || typeof body !== 'object') {
            console.error('[Revalidate] Invalid body structure:', body)
            return NextResponse.json({
                success: false,
                error: 'Invalid request',
                message: 'Request body must be an object'
            }, { status: 400 })
        }

        // Extract data from Sanity webhook payload
        const { _type, slug, _id } = body
        const operation = body._operation || 'update' // create, update, delete

        // ═══════════════════════════════════════════════════════════
        // EDGE CASE 3: Missing required fields
        // ═══════════════════════════════════════════════════════════
        if (!_type) {
            console.error('[Revalidate] Missing _type field in webhook payload')
            return NextResponse.json({
                success: false,
                error: 'Invalid payload',
                message: 'Missing required field: _type'
            }, { status: 400 })
        }

        console.log(`[Revalidate] Processing ${operation} on ${_type} (slug: ${slug?.current || 'none'})`)

        const pathsRevalidated: string[] = []
        const errors: string[] = []

        // Helper function to safely revalidate paths
        const safeRevalidate = async (path: string, description: string) => {
            try {
                await revalidatePath(path)
                pathsRevalidated.push(path)
                console.log(`[Revalidate] ✅ ${description}: ${path}`)
            } catch (error) {
                const errorMsg = `Failed to revalidate ${description} (${path}): ${error}`
                errors.push(errorMsg)
                console.error(`[Revalidate] ❌ ${errorMsg}`)
            }
        }

        // ═══════════════════════════════════════════════════════════
        // SMART HYBRID REVALIDATION LOGIC
        // ═══════════════════════════════════════════════════════════

        switch (_type) {
            // ─────────────────────────────────────────────────────────
            // FAQ CONTENT
            // ─────────────────────────────────────────────────────────
            case 'faq': {
                // FAQ appears only on one page
                await safeRevalidate('/faq', 'FAQ page')
                break
            }

            // ─────────────────────────────────────────────────────────
            // COLLEGE CONTENT
            // ─────────────────────────────────────────────────────────
            case 'college': {
                const currentSlug = slug?.current

                // EDGE CASE 4: College without slug (draft or invalid)
                if (!currentSlug && operation !== 'delete') {
                    console.warn('[Revalidate] College missing slug, only revalidating list:', { id: _id, operation })
                    await safeRevalidate('/colleges', 'Colleges list (no slug available)')
                    break
                }

                // EDGE CASE 5: College deletion
                if (operation === 'delete') {
                    console.log('[Revalidate] College deleted, revalidating list and detail page')
                    await safeRevalidate('/colleges', 'Colleges list (deletion)')
                    if (currentSlug) {
                        await safeRevalidate(`/colleges/${currentSlug}`, 'Deleted college detail page')
                    }
                    break
                }

                // EDGE CASE 6: New college creation
                if (operation === 'create') {
                    console.log('[Revalidate] New college created, revalidating list')
                    await safeRevalidate('/colleges', 'Colleges list (new college)')
                    await safeRevalidate(`/colleges/${currentSlug}`, 'New college detail page')
                    break
                }

                // EDGE CASE 7: Slug change detection
                // Sanity webhook might include previous slug in some cases
                const previousSlug = body._previousRevision?.slug?.current
                if (previousSlug && previousSlug !== currentSlug) {
                    console.log('[Revalidate] College slug changed:', { old: previousSlug, new: currentSlug })
                    // Revalidate both old and new URLs
                    await safeRevalidate(`/colleges/${previousSlug}`, 'Old college slug (redirect/404)')
                    await safeRevalidate(`/colleges/${currentSlug}`, 'New college slug')
                    await safeRevalidate('/colleges', 'Colleges list (slug change)')
                    break
                }

                // EDGE CASE 8: Visibility change (isVisible field)
                const wasVisible = body._previousRevision?.isVisible
                const isVisible = body.isVisible
                if (wasVisible !== undefined && wasVisible !== isVisible) {
                    console.log('[Revalidate] College visibility changed:', { wasVisible, isVisible })
                    // Visibility change affects the list
                    await safeRevalidate('/colleges', 'Colleges list (visibility change)')
                    await safeRevalidate(`/colleges/${currentSlug}`, 'College detail page (visibility change)')
                    break
                }

                // EDGE CASE 9: Name change (affects list display)
                const previousName = body._previousRevision?.name
                const currentName = body.name
                if (previousName && previousName !== currentName) {
                    console.log('[Revalidate] College name changed:', { old: previousName, new: currentName })
                    // Always revalidate list when name changes
                    await safeRevalidate('/colleges', 'Colleges list (name change)')
                    await safeRevalidate(`/colleges/${currentSlug}`, 'College detail page (name change)')
                    break
                }

                // Default: Minor update (description, fees, etc.)
                console.log('[Revalidate] College minor update, revalidating detail and list')
                await safeRevalidate(`/colleges/${currentSlug}`, 'College detail page')
                await safeRevalidate('/colleges', 'Colleges list')
                break
            }

            // ─────────────────────────────────────────────────────────
            // BLOG POST CONTENT
            // ─────────────────────────────────────────────────────────
            case 'post': {
                const currentSlug = slug?.current

                // EDGE CASE 10: Blog post without slug
                if (!currentSlug && operation !== 'delete') {
                    console.warn('[Revalidate] Blog post missing slug, only revalidating list:', { id: _id })
                    await safeRevalidate('/blog', 'Blog list (no slug available)')
                    break
                }

                // EDGE CASE 11: Blog post deletion
                if (operation === 'delete') {
                    console.log('[Revalidate] Blog post deleted')
                    await safeRevalidate('/blog', 'Blog list (deletion)')
                    if (currentSlug) {
                        await safeRevalidate(`/blog/${currentSlug}`, 'Deleted blog post')
                    }
                    break
                }

                // EDGE CASE 12: New blog post
                if (operation === 'create') {
                    console.log('[Revalidate] New blog post created')
                    await safeRevalidate('/blog', 'Blog list (new post)')
                    await safeRevalidate(`/blog/${currentSlug}`, 'New blog post detail')
                    break
                }

                // EDGE CASE 13: Slug change
                const previousSlug = body._previousRevision?.slug?.current
                if (previousSlug && previousSlug !== currentSlug) {
                    console.log('[Revalidate] Blog post slug changed:', { old: previousSlug, new: currentSlug })
                    await safeRevalidate(`/blog/${previousSlug}`, 'Old blog slug')
                    await safeRevalidate(`/blog/${currentSlug}`, 'New blog slug')
                    await safeRevalidate('/blog', 'Blog list (slug change)')
                    break
                }

                // Default: Minor update
                await safeRevalidate(`/blog/${currentSlug}`, 'Blog post detail')
                await safeRevalidate('/blog', 'Blog list')
                break
            }

            // ─────────────────────────────────────────────────────────
            // TIMELINE / IMPORTANT DATES
            // ─────────────────────────────────────────────────────────
            case 'timeline': {
                // Timeline appears on multiple pages
                await safeRevalidate('/timeline', 'Timeline page')
                await safeRevalidate('/', 'Homepage (timeline widget)')
                break
            }

            // ─────────────────────────────────────────────────────────
            // SITE SETTINGS (affects multiple pages)
            // ─────────────────────────────────────────────────────────
            case 'siteSettings': {
                console.log('[Revalidate] Site settings changed, revalidating all pages')
                // Site settings affect the entire site (navbar, footer, etc.)
                await safeRevalidate('/', 'Homepage')
                await safeRevalidate('/colleges', 'Colleges page')
                await safeRevalidate('/blog', 'Blog page')
                await safeRevalidate('/faq', 'FAQ page')
                await safeRevalidate('/timeline', 'Timeline page')
                await safeRevalidate('/socials', 'Socials page')
                break
            }

            // ─────────────────────────────────────────────────────────
            // CUTOFF DATA
            // ─────────────────────────────────────────────────────────
            case 'cutoff':
            case 'collegeCutoff': {
                const collegeSlug = body.college?.slug?.current

                // Revalidate the affected college page
                if (collegeSlug) {
                    await safeRevalidate(`/colleges/${collegeSlug}`, 'College page (cutoff data)')
                }

                // Predictor and rank-finder might use this data
                await safeRevalidate('/predictor', 'Predictor tool')
                await safeRevalidate('/rank-finder', 'Rank finder tool')
                break
            }

            // ─────────────────────────────────────────────────────────
            // EDGE CASE 14: Unknown content type
            // ─────────────────────────────────────────────────────────
            default: {
                console.warn(`[Revalidate] Unknown content type: ${_type}, performing conservative revalidation`)
                // Conservative approach: revalidate homepage and common pages
                await safeRevalidate('/', 'Homepage (unknown type)')
                await safeRevalidate('/colleges', 'Colleges page (unknown type)')
                await safeRevalidate('/blog', 'Blog page (unknown type)')
            }
        }

        // ═══════════════════════════════════════════════════════════
        // RESPONSE WITH DETAILED RESULTS
        // ═══════════════════════════════════════════════════════════
        const response = {
            success: errors.length === 0,
            revalidated: pathsRevalidated.length > 0,
            timestamp: new Date().toISOString(),
            type: _type,
            operation,
            slug: slug?.current,
            pathsRevalidated,
            pathCount: pathsRevalidated.length,
            errors: errors.length > 0 ? errors : undefined,
        }

        // Summary log instead of full object
        console.log(`[Revalidate] Completed: ${pathsRevalidated.length} paths revalidated`)

        // Return appropriate status code
        if (errors.length > 0 && pathsRevalidated.length === 0) {
            // All revalidations failed
            return NextResponse.json(response, { status: 500 })
        } else if (errors.length > 0) {
            // Partial success
            return NextResponse.json(response, { status: 207 }) // Multi-Status
        } else {
            // Complete success
            return NextResponse.json(response, { status: 200 })
        }

    } catch (error) {
        // ═══════════════════════════════════════════════════════════
        // EDGE CASE 15: Unexpected server error
        // ═══════════════════════════════════════════════════════════
        console.error('[Revalidate] Unexpected error:', error)

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════
// EDGE CASE 16: Method not allowed (GET, PUT, etc.)
// ═══════════════════════════════════════════════════════════
export async function GET() {
    return NextResponse.json({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
        usage: 'POST /api/revalidate?token=YOUR_TOKEN with Sanity webhook payload'
    }, { status: 405 })
}
