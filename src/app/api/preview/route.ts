import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const token = searchParams.get('token')

  if (!url || !token) {
    return new Response('Missing URL or Token', { status: 400 })
  }

  const payload = await getPayload({ config })

  // Verify the token with Payload
  // Note: Payload v3 verifyToken check
  try {
    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      return new Response('Invalid Token', { status: 403 })
    }

    // Enable Draft Mode in Next.js
    const draft = await draftMode()
    draft.enable()
    
    // Redirect to the actual page
    redirect(url)
  } catch (error) {
    console.error('Preview error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

