/**
 * CSV Import utilities for importing college data
 */

export interface CSVRow {
    [key: string]: string
}

export interface CSVParseResult {
    headers: string[]
    rows: CSVRow[]
    errors: string[]
}

export interface ImportResult {
    success: boolean
    imported: number
    updated: number
    failed: number
    errors: string[]
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvContent: string): CSVParseResult {
    const errors: string[] = []
    const lines = csvContent.trim().split('\n')

    if (lines.length < 2) {
        return { headers: [], rows: [], errors: ['CSV file must have at least a header row and one data row'] }
    }

    // Parse header
    const headers = parseCSVLine(lines[0])

    // Parse data rows
    const rows: CSVRow[] = []
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        try {
            const values = parseCSVLine(line)

            if (values.length !== headers.length) {
                errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`)
                continue
            }

            const row: CSVRow = {}
            headers.forEach((header, j) => {
                row[header.trim()] = values[j].trim()
            })
            rows.push(row)
        } catch (e) {
            errors.push(`Row ${i + 1}: Failed to parse - ${e}`)
        }
    }

    return { headers, rows, errors }
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current)
            current = ''
        } else {
            current += char
        }
    }

    result.push(current)
    return result
}

/**
 * Validate a row has required fields
 */
export function validateRow(row: CSVRow): string[] {
    const errors: string[] = []

    if (!row.name || row.name.trim() === '') {
        errors.push('Missing required field: name')
    }

    if (!row.location || row.location.trim() === '') {
        errors.push('Missing required field: location')
    }

    if (!row.type || !['Government', 'Private', 'Semi-Govt'].includes(row.type)) {
        errors.push('Invalid type: must be Government, Private, or Semi-Govt')
    }

    if (row.estYear && isNaN(parseInt(row.estYear))) {
        errors.push('Invalid estYear: must be a number')
    }

    return errors
}

/**
 * Get expected CSV headers
 */
export function getExpectedHeaders(): string[] {
    return [
        'name',        // Required
        'location',    // Required
        'type',        // Required: Government, Private, Semi-Govt
        'estYear',     // Optional: Number
        'website',     // Optional: URL
        'shortName',   // Optional: Acronym
        'isVisible',   // Optional: true/false
        'description'  // Optional: SEO description
    ]
}

/**
 * Generate sample CSV template
 */
export function generateCSVTemplate(): string {
    const headers = getExpectedHeaders()
    const sampleRow = [
        '"Jadavpur University"',
        '"Kolkata"',
        '"Government"',
        '"1955"',
        '"https://jadavpuruniversity.in"',
        '"JU"',
        '"true"',
        '"Top engineering college in West Bengal"'
    ]

    return headers.join(',') + '\n' + sampleRow.join(',')
}
