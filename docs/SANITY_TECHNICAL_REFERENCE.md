# Sanity Studio Technical Reference

## Architecture Overview

### Technology Stack
- **Framework**: Sanity Studio v3
- **UI Library**: @sanity/ui
- **Icons**: lucide-react
- **Language**: TypeScript
- **Storage**: Sanity Cloud + localStorage (for sensitive data)

### Project Structure
```
src/sanity/
├── actions/              # Custom document actions
│   └── DuplicateAction.ts
├── components/           # Dashboard widgets & UI components
│   ├── AnalyticsDashboardWidget.tsx
│   ├── BulkMediaUploadWidget.tsx
│   ├── BulkSeoWidget.tsx
│   ├── CustomDeployWidget.tsx
│   ├── DataQualityWidget.tsx
│   ├── DuplicateDetectionWidget.tsx
│   ├── ExportTemplatesWidget.tsx
│   ├── SmartValidationWidget.tsx
│   ├── VisibilityWidget.tsx
│   ├── ActionsWidget.tsx
│   ├── CollegePreview.tsx
│   ├── CollegePreviewPane.tsx
│   └── types.ts
├── schemaTypes/          # Content schemas
│   ├── documents/
│   │   ├── college.ts
│   │   ├── collegeCutoff.ts
│   │   ├── collegeDetail.ts
│   │   ├── postType.ts
│   │   ├── authorType.ts
│   │   ├── categoryType.ts
│   │   ├── siteSettings.ts
│   │   └── timeline.ts
│   ├── objects/
│   │   └── blockContentType.ts
│   └── index.ts
├── utils/                # Utility functions
│   ├── hooks/
│   │   ├── useDeployment.ts
│   │   ├── useSanityActions.ts
│   │   └── useSanityStats.ts
│   ├── bulkUpdate.ts
│   ├── csvImport.ts
│   ├── dataActions.ts
│   ├── deployActions.ts
│   ├── duplicateDetection.ts
│   ├── exportTemplates.ts
│   ├── smartValidation.ts
│   └── templateEngine.ts
├── theme/
│   └── customTheme.ts
├── client.ts
├── env.ts
├── lib/
│   ├── client.ts
│   ├── image.ts
│   └── live.ts
├── structure.ts
└── studio.css
```

---

## Widget Development

### Creating a New Widget

```typescript
'use client'

import { Card, Stack, Text } from '@sanity/ui'
import { useClient } from 'sanity'
import { apiVersion } from '../env'

export function MyCustomWidget() {
    const client = useClient({ apiVersion })

    return (
        <Card padding={4}>
            <Stack space={3}>
                <Text size={2} weight="bold">My Widget</Text>
                {/* Widget content */}
            </Stack>
        </Card>
    )
}
```

### Registering Widget

In `sanity.config.ts`:

```typescript
import { MyCustomWidget } from './src/sanity/components/MyCustomWidget'

dashboardTool({
  widgets: [
    {
      name: 'my-custom-widget',
      component: MyCustomWidget,
      layout: { width: 'medium', height: 'auto' }
    }
  ]
})
```

### Widget Layout Options

- **width**: `'small'` | `'medium'` | `'large'` | `'full'`
- **height**: `'auto'` | `'small'` | `'medium'` | `'large'`

---

## Data Fetching

### Using Sanity Client

```typescript
import { useClient } from 'sanity'
import { apiVersion } from '../env'

const client = useClient({ apiVersion })

// Fetch documents
const colleges = await client.fetch(`
    *[_type == "college"] {
        _id, name, location, type
    }
`)

// Create document
await client.create({
    _type: 'college',
    name: 'Example College',
    location: 'Kolkata'
})

// Update document
await client
    .patch(documentId)
    .set({ name: 'Updated Name' })
    .commit()

// Delete document
await client.delete(documentId)
```

### GROQ Query Examples

```groq
// Basic query
*[_type == "college"]

// With filter
*[_type == "college" && isVisible == true]

// With projection
*[_type == "college"] {
    _id, name, location
}

// With sorting
*[_type == "college"] | order(name asc)

// With limit
*[_type == "college"][0...10]

// With references
*[_type == "college"] {
    _id,
    name,
    details->
}

// Count
count(*[_type == "college"])
```

---

## Utility Functions

### Smart Validation

```typescript
import { validateCollege, validateColleges, autoFixIssues } from '../utils/smartValidation'

// Validate single college
const result = validateCollege(collegeData)

// Validate multiple
const results = await validateColleges(client, collegeIds)

// Auto-fix issues
const { fixed, failed } = await autoFixIssues(client, collegeId, issues)
```

### Duplicate Detection

```typescript
import { findDuplicates, groupDuplicates, mergeDuplicates } from '../utils/duplicateDetection'

// Find duplicates
const matches = await findDuplicates(client, threshold)

// Group duplicates
const groups = groupDuplicates(matches)

// Merge duplicates
const result = await mergeDuplicates(client, primaryId, duplicateIds)
```

### Bulk Updates

```typescript
import { bulkUpdateSeoDescriptions } from '../utils/bulkUpdate'

// Update SEO descriptions
const results = await bulkUpdateSeoDescriptions(
    client,
    collegeIds,
    template,
    (progress) => console.log(progress)
)
```

### Export Templates

```typescript
import { exportWithTemplate, saveTemplate, loadTemplates } from '../utils/exportTemplates'

// Export with template
const result = await exportWithTemplate(client, template, filter)

// Save template
saveTemplate({
    name: 'My Template',
    fields: ['name', 'location', 'type'],
    format: 'csv'
})

// Load templates
const templates = loadTemplates()
```

---

## Custom Hooks

### useSanityStats

```typescript
import { useSanityStats } from '../utils/hooks/useSanityStats'

function MyComponent() {
    const { loading, error, data, refetch } = useSanityStats()

    if (loading) return <Spinner />
    if (error) return <Text>{error}</Text>

    return <div>{data.stats.total} colleges</div>
}
```

### useSanityActions

```typescript
import { useSanityActions } from '../utils/hooks/useSanityActions'

function MyComponent() {
    const {
        exporting,
        deleting,
        importing,
        publishing,
        validating,
        rebuilding,
        validationIssues,
        handleExport,
        handleDelete,
        handleImport,
        handlePublish,
        handleValidate,
        handleRebuild
    } = useSanityActions()

    return (
        <Button
            onClick={() => handleExport('json')}
            disabled={exporting}
        >
            Export
        </Button>
    )
}
```

### useDeployment

```typescript
import { useDeployment } from '../utils/hooks/useDeployment'

function MyComponent() {
    const {
        targets,
        deploying,
        lastDeployed,
        deploy,
        addTarget,
        deleteDeployTarget
    } = useDeployment()

    return (
        <Button onClick={() => deploy(targetId)}>
            Deploy
        </Button>
    )
}
```

---

## Schema Definitions

### Document Schema Example

```typescript
import { defineField, defineType } from 'sanity'

export const myDocumentType = defineType({
    name: 'myDocument',
    title: 'My Document',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Title',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
                source: 'title',
                maxLength: 96
            }
        }),
        defineField({
            name: 'description',
            type: 'text',
            title: 'Description',
            rows: 3
        })
    ]
})
```

### Field Types

- `string` - Single line text
- `text` - Multi-line text
- `number` - Numeric value
- `boolean` - True/false
- `date` - Date picker
- `datetime` - Date and time
- `url` - URL field
- `slug` - URL-friendly slug
- `image` - Image upload
- `file` - File upload
- `array` - Array of items
- `object` - Nested object
- `reference` - Reference to another document
- `block` - Portable text (rich text)

### Validation Rules

```typescript
validation: Rule => Rule
    .required()
    .min(10)
    .max(100)
    .regex(/^[A-Z]/, { name: 'uppercase', message: 'Must start with uppercase' })
    .custom(value => {
        if (value === 'invalid') {
            return 'This value is not allowed'
        }
        return true
    })
```

---

## Custom Actions

### Document Action Example

```typescript
import { defineAction } from 'sanity'

export const MyAction = defineAction({
    name: 'myAction',
    title: 'My Action',
    icon: () => '🚀',
    action: async (props) => {
        const { id, type, draft, published } = props

        // Perform action
        await doSomething(id)

        // Return result
        return {
            type: 'success',
            message: 'Action completed'
        }
    }
})
```

### Registering Action

```typescript
document: {
    actions: (prev, context) => {
        if (context.schemaType === 'college') {
            return [...prev, MyAction]
        }
        return prev
    }
}
```

---

## Environment Variables

### Required Variables

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Optional
SANITY_API_READ_TOKEN=your-read-token
SANITY_API_WRITE_TOKEN=your-write-token
```

### Accessing in Code

```typescript
// src/sanity/env.ts
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!
```

---

## Security Best Practices

### 1. Sensitive Data Storage

**❌ Don't**: Store sensitive data in Sanity
```typescript
// BAD: Storing webhook URL in Sanity
await client.create({
    _type: 'deployTarget',
    webhookUrl: 'https://vercel.com/...' // Contains secret token!
})
```

**✅ Do**: Use localStorage for sensitive data
```typescript
// GOOD: Storing in browser localStorage
localStorage.setItem('deploy-targets', JSON.stringify(targets))
```

### 2. API Tokens

- Never commit tokens to git
- Use environment variables
- Rotate tokens regularly
- Use read-only tokens when possible

### 3. Validation

- Always validate user input
- Sanitize data before saving
- Use TypeScript for type safety
- Implement server-side validation

---

## Performance Optimization

### 1. Query Optimization

**❌ Don't**: Fetch all fields
```groq
*[_type == "college"]
```

**✅ Do**: Project only needed fields
```groq
*[_type == "college"] {
    _id, name, location
}
```

### 2. Pagination

```groq
*[_type == "college"][0...10]  // First 10
*[_type == "college"][10...20] // Next 10
```

### 3. Caching

```typescript
// Use React state for caching
const [cachedData, setCachedData] = useState(null)

useEffect(() => {
    if (!cachedData) {
        fetchData().then(setCachedData)
    }
}, [cachedData])
```

### 4. Batch Operations

```typescript
// Batch updates in transactions
const transaction = client.transaction()
ids.forEach(id => {
    transaction.patch(id).set({ field: value })
})
await transaction.commit()
```

---

## Testing

### Unit Testing Utilities

```typescript
import { validateCollege } from '../utils/smartValidation'

describe('Smart Validation', () => {
    it('should detect missing name', () => {
        const result = validateCollege({ name: '' })
        expect(result.isValid).toBe(false)
        expect(result.issues).toContainEqual(
            expect.objectContaining({
                field: 'name',
                severity: 'error'
            })
        )
    })
})
```

### Integration Testing

```typescript
import { findDuplicates } from '../utils/duplicateDetection'

describe('Duplicate Detection', () => {
    it('should find similar colleges', async () => {
        const mockClient = createMockClient()
        const matches = await findDuplicates(mockClient, 70)
        expect(matches.length).toBeGreaterThan(0)
    })
})
```

---

## Deployment

### Build Process

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build
npm run build

# Deploy
vercel deploy
```

### Environment Setup

1. **Development**: `.env.local`
2. **Staging**: Vercel environment variables
3. **Production**: Vercel environment variables

---

## Troubleshooting

### Common TypeScript Errors

**Error**: `Property 'X' does not exist on type 'Y'`
- **Fix**: Add proper type definitions

**Error**: `Cannot find module 'X'`
- **Fix**: Check import path, run `npm install`

**Error**: `Type 'X' is not assignable to type 'Y'`
- **Fix**: Add type assertion or fix type mismatch

### Common Runtime Errors

**Error**: `Cannot read property 'X' of undefined`
- **Fix**: Add null checks, use optional chaining

**Error**: `Network request failed`
- **Fix**: Check API credentials, network connection

**Error**: `Permission denied`
- **Fix**: Check Sanity project permissions

---

## API Reference

### Client Methods

```typescript
// Fetch
client.fetch(query, params)

// Create
client.create(document)

// Patch
client.patch(id).set(fields).commit()

// Delete
client.delete(id)

// Transaction
client.transaction().create(...).patch(...).commit()

// Assets
client.assets.upload(type, file, options)
```

### Widget Props

```typescript
interface WidgetProps {
    // No props passed to dashboard widgets
}
```

---

## Contributing

### Adding a New Widget

1. Create component in `src/sanity/components/`
2. Import in `sanity.config.ts`
3. Add to dashboard widgets array
4. Update documentation
5. Test thoroughly
6. Submit PR

### Code Style

- Use TypeScript
- Follow existing patterns
- Add JSDoc comments
- Use meaningful variable names
- Keep functions small and focused

---

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Reference](https://www.sanity.io/docs/groq)
- [Sanity UI Components](https://www.sanity.io/ui)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Technical Reference v2.0** | January 2026
