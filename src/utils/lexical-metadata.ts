export interface TOCEntry {
  id: string
  text: string
  level: number
}

/**
 * Extracts plain text from Lexical-style JSON and returns a heading-based Table of Contents.
 * Also returns word count for reading time calculation.
 */
export function extractLexicalMetadata(body: unknown): {
  plainText: string
  toc: TOCEntry[]
  wordCount: number
} {
  const toc: TOCEntry[] = []
  let plainText = ''

  const docBody = body as { root?: { children?: unknown[] } }
  if (!docBody || !docBody.root || !Array.isArray(docBody.root.children)) {
    return { plainText: '', toc: [], wordCount: 0 }
  }

  const traverse = (nodes: unknown[]) => {
    nodes.forEach((node: unknown) => {
      const n = node as { type?: string, children?: unknown[], tag?: string, text?: string }
      if (n.type === 'heading') {
        const text = n.children
          ?.map((c: unknown) => (c as { text?: string }).text)
          .join('')
          .trim()
        
        if (text) {
          const level = parseInt((n.tag || '').replace('h', '')) || 2
          const id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
          
          toc.push({ id, text, level })
        }
      }

      if (n.text) {
        plainText += n.text + ' '
      }

      if (Array.isArray(n.children)) {
        traverse(n.children)
      }
    })
  }

  traverse(docBody.root.children as unknown[])

  const words = plainText.trim().split(/\s+/).filter(Boolean)
  
  return {
    plainText: plainText.trim(),
    toc,
    wordCount: words.length
  }
}

/**
 * Estimates reading time in minutes based on word count.
 * Average reading speed: 200-250 words per minute.
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount === 0) return 0
  const minutes = Math.ceil(wordCount / 225)
  return Math.max(1, minutes)
}
