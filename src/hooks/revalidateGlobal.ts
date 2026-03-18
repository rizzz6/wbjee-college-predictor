import { GlobalAfterChangeHook, Payload } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateGlobal = (
  paths: string[]
): GlobalAfterChangeHook => {
  const revalidate = async ({ doc, req: { payload } }: { doc: unknown; req: { payload: Payload } }) => {
    for (const path of paths) {
      payload.logger.info(`Revalidating global path: ${path}`)
      try {
        revalidatePath(path)
      } catch (err) {
        payload.logger.error(`Error revalidating global path ${path}: ${err}`)
      }
    }

    return doc as Record<string, unknown>
  }

  return revalidate
}
