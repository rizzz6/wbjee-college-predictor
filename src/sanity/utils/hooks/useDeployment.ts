'use client'

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@sanity/ui'
import {
    type DeployTarget,
    triggerDeployment,
    loadDeployTargets,
    saveDeployTarget,
    deleteDeployTarget as deleteTarget
} from '../deployActions'

/**
 * Custom hook for managing deployment state and actions
 * USES LOCALSTORAGE for security
 */
export function useDeployment() {
    const toast = useToast()
    const [targets, setTargets] = useState<DeployTarget[]>([])
    const [deploying, setDeploying] = useState<Record<string, boolean>>({})
    const [lastDeployed, setLastDeployed] = useState<Record<string, number>>({})

    // Load targets on mount
    useEffect(() => {
        setTargets(loadDeployTargets())
    }, [])

    // Deploy to a specific target
    const deploy = useCallback(async (target: DeployTarget) => {
        setDeploying(prev => ({ ...prev, [target.id]: true }))

        try {
            const result = await triggerDeployment(target.url, target.name)

            if (result.success) {
                toast.push({
                    status: 'success',
                    title: 'Deployment Started',
                    description: result.message
                })
                setLastDeployed(prev => ({ ...prev, [target.id]: Date.now() }))
            } else {
                toast.push({
                    status: 'error',
                    title: 'Deployment Failed',
                    description: result.message
                })
            }

            return result
        } finally {
            setDeploying(prev => ({ ...prev, [target.id]: false }))
        }
    }, [toast])

    // Add or update a target
    const addTarget = useCallback((target: DeployTarget) => {
        saveDeployTarget(target)
        setTargets(loadDeployTargets())

        toast.push({
            status: 'success',
            title: 'Target Saved',
            description: `Deploy target "${target.name}" saved successfully`
        })
    }, [toast])

    // Delete a target
    const deleteDeployTarget = useCallback((id: string) => {
        deleteTarget(id)
        setTargets(loadDeployTargets())

        toast.push({
            status: 'success',
            title: 'Target Deleted',
            description: 'Deploy target removed'
        })
    }, [toast])

    return {
        targets,
        deploying,
        lastDeployed,
        deploy,
        addTarget,
        deleteDeployTarget
    }
}
