import { useDocumentOperation } from 'sanity'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'
import { CopyIcon } from '@sanity/icons'
import { useCallback, useState } from 'react'

export function DuplicateAction(props: any) {
    const { patch, publish } = useDocumentOperation(props.id, props.type)
    const router = useRouter()
    const client = useClient({ apiVersion: '2024-01-01' })
    const [isDuplicating, setIsDuplicating] = useState(false)

    const onHandle = useCallback(async () => {
        setIsDuplicating(true)

        try {
            // 1. Fetch the current document
            const doc = await client.fetch(`*[_id == $id][0]`, { id: props.id })

            if (!doc) {
                setIsDuplicating(false)
                return
            }

            // 2. Prepare the new document (remove system fields)
            const { _id, _createdAt, _updatedAt, _rev, slug, ...rest } = doc

            const newDoc = {
                ...rest,
                _type: 'college',
                name: `${doc.name} (Copy)`,
                isVisible: false, // Default to hidden
                // Explicitly clear slug to avoid conflicts
                slug: undefined,
                // Reset sync status
                lastSyncedAt: undefined,
                detailsIdentifier: undefined
            }

            // 3. Create the new document
            const createdDoc = await client.create(newDoc)

            // 4. Navigate to the new document
            router.navigateIntent('edit', { id: createdDoc._id, type: createdDoc._type })

        } catch (err) {
            console.error('Error duplicating document:', err)
            alert('Failed to duplicate college')
        } finally {
            setIsDuplicating(false)
        }
    }, [props.id, client, router])

    if (props.type !== 'college') {
        return null
    }

    return {
        label: isDuplicating ? 'Duplicating...' : 'Duplicate College',
        icon: CopyIcon,
        onHandle,
        disabled: isDuplicating
    }
}
