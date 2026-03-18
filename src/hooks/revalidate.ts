import { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateCollection = <T = unknown>(
  paths: string[] | ((doc: T) => string[])
): CollectionAfterChangeHook & CollectionAfterDeleteHook => {
  const revalidate = async ({ doc, req: { payload } }: { doc: T; req: { payload: Payload } }) => {
    const resolvedPaths = typeof paths === 'function' ? paths(doc) : paths

    for (const path of resolvedPaths) {
      payload.logger.info(`Revalidating path: ${path}`)
      try {
        revalidatePath(path)
      } catch (err) {
        payload.logger.error(`Error revalidating path ${path}: ${err}`)
      }
    }

    return doc as Record<string, unknown>
  }

  return revalidate
}
