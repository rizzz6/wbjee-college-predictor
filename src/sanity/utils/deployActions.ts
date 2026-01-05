/**
 * Deployment utilities for triggering and managing Vercel deployments
 * USES LOCALSTORAGE - webhook URLs are sensitive and should not be in Sanity
 */

export interface DeployTarget {
    id: string
    name: string
    url: string
    branch?: string
}

export interface DeployResult {
    success: boolean
    message: string
    target?: DeployTarget
}

/**
 * Trigger a deployment via webhook
 */
export async function triggerDeployment(webhookUrl: string, targetName: string): Promise<DeployResult> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            return {
                success: true,
                message: `Deployment triggered for ${targetName}`
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return {
            success: false,
            message: `Failed to deploy ${targetName}: ${message}`
        }
    }
}

/**
 * Validate webhook URL format
 */
export function validateWebhookUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:' && parsed.hostname.includes('vercel')
    } catch {
        return false
    }
}

/**
 * Load deploy targets from localStorage
 */
export function loadDeployTargets(): DeployTarget[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem('sanity-deploy-targets')
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

/**
 * Save deploy targets to localStorage
 */
export function saveDeployTargets(targets: DeployTarget[]): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem('sanity-deploy-targets', JSON.stringify(targets))
    } catch (error) {
        console.error('Failed to save deploy targets:', error)
    }
}

/**
 * Delete a deploy target
 */
export function deleteDeployTarget(id: string): void {
    const targets = loadDeployTargets()
    const filtered = targets.filter(t => t.id !== id)
    saveDeployTargets(filtered)
}

/**
 * Add or update a deploy target
 */
export function saveDeployTarget(target: DeployTarget): void {
    const targets = loadDeployTargets()
    const existing = targets.findIndex(t => t.id === target.id)

    if (existing >= 0) {
        targets[existing] = target
    } else {
        targets.push(target)
    }

    saveDeployTargets(targets)
}
