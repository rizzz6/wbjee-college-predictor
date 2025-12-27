#!/usr/bin/env node
/**
 * Test Webhook Revalidation Endpoint
 * 
 * Usage:
 *   node scripts/test-webhook.mjs
 *   node scripts/test-webhook.mjs production
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env.local from project root
config({ path: join(rootDir, '.env.local') })

const LOCAL_URL = 'http://localhost:3000/api/revalidate'
const PROD_URL = 'https://www.rwbjee.com/api/revalidate'

const args = process.argv.slice(2)
const isProd = args.includes('production') || args.includes('prod')
const baseUrl = isProd ? PROD_URL : LOCAL_URL

// Read token from environment
const token = process.env.SANITY_REVALIDATE_TOKEN

if (!token) {
    console.error('❌ SANITY_REVALIDATE_TOKEN environment variable not set!')
    console.error('\nSet it in .env.local:')
    console.error('SANITY_REVALIDATE_TOKEN=your-secret-token-here\n')
    process.exit(1)
}

console.log(`\n🧪 Testing Webhook Endpoint: ${isProd ? 'PRODUCTION' : 'LOCAL'}\n`)

// Test cases
const tests = [
    {
        name: 'FAQ Update',
        payload: {
            _type: 'faq',
            _id: 'faq-test-1',
            _operation: 'update'
        }
    },
    {
        name: 'New College',
        payload: {
            _type: 'college',
            _id: 'college-new',
            slug: { current: 'test-college' },
            name: 'Test College',
            _operation: 'create'
        }
    },
    {
        name: 'College Update',
        payload: {
            _type: 'college',
            _id: 'college-update',
            slug: { current: 'jadavpur-university' },
            name: 'Jadavpur University',
            _operation: 'update'
        }
    },
    {
        name: 'College Slug Change',
        payload: {
            _type: 'college',
            _id: 'college-slug-change',
            slug: { current: 'new-slug' },
            _previousRevision: {
                slug: { current: 'old-slug' }
            },
            _operation: 'update'
        }
    },
    {
        name: 'College Deletion',
        payload: {
            _type: 'college',
            _id: 'college-deleted',
            slug: { current: 'deleted-college' },
            _operation: 'delete'
        }
    },
    {
        name: 'Blog Post Update',
        payload: {
            _type: 'post',
            _id: 'post-update',
            slug: { current: 'test-post' },
            title: 'Test Post',
            _operation: 'update'
        }
    },
    {
        name: 'Invalid Token (should fail)',
        url: `${baseUrl}?token=wrong-token`,
        payload: { _type: 'faq' },
        shouldFail: true
    },
    {
        name: 'Missing Type (should  fail)',
        payload: { _id: 'test-no-type' },
        shouldFail: true
    }
]

// Run tests
async function runTests() {
    let passed = 0
    let failed = 0

    for (const test of tests) {
        const url = test.url || `${baseUrl}?token=${encodeURIComponent(token)}`

        try {
            console.log(`\n► Testing: ${test.name}`)
            console.log(`  Payload: ${JSON.stringify(test.payload, null, 2).substring(0, 100)}...`)

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.payload)
            })

            const data = await response.json()

            if (test.shouldFail) {
                if (!response.ok) {
                    console.log(`  ✅ PASS: Failed as expected (${response.status})`)
                    console.log(`  Message: ${data.message || data.error}`)
                    passed++
                } else {
                    console.log(`  ❌ FAIL: Should have failed but succeeded`)
                    failed++
                }
            } else {
                if (response.ok) {
                    console.log(`  ✅ PASS: ${response.status}`)
                    console.log(`  Revalidated: ${data.pathsRevalidated?.join(', ')}`)
                    passed++
                } else {
                    console.log(`  ❌ FAIL: ${response.status}`)
                    console.log(`  Error: ${data.message || data.error}`)
                    failed++
                }
            }
        } catch (error) {
            console.log(`  ❌ FAIL: ${error.message}`)
            failed++
        }
    }

    console.log(`\n${'='.repeat(50)}`)
    console.log(`Results: ${passed} passed, ${failed} failed`)
    console.log(`${'='.repeat(50)}\n`)

    if (failed > 0) {
        process.exit(1)
    }
}

runTests().catch(console.error)
