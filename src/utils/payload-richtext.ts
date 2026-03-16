import type { SerializedEditorState } from 'lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { JSDOM } from 'jsdom'

import { sanitizeRichHtml } from './sanitize-rich-html'

import { convertHTMLToLexical } from '@payloadcms/richtext-lexical'
import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical'

type EditorConfigLike = SanitizedServerEditorConfig

type LegacyTextItem =
  | string
  | {
      label?: string | null
      name?: string | null
      text?: string | null
      value?: string | null
    }
  | null
  | undefined

export function isRichTextState(value: unknown): value is SerializedEditorState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybeState = value as { root?: unknown }
  return typeof maybeState.root === 'object' && maybeState.root !== null
}

export function getPayloadEditorConfig(editor: unknown): EditorConfigLike | undefined {
  if (!editor || typeof editor !== 'object' || !('editorConfig' in editor)) {
    return undefined
  }

  return (editor as { editorConfig?: EditorConfigLike }).editorConfig
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getTextValue(item: LegacyTextItem, keys: Array<'label' | 'name' | 'text' | 'value'>): string | null {
  if (typeof item === 'string') {
    const trimmed = item.trim()
    return trimmed ? trimmed : null
  }

  if (!item || typeof item !== 'object') {
    return null
  }

  for (const key of keys) {
    const value = item[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

export function normalizeTagItems(tags: unknown): Array<{ label: string }> {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .map((item) => getTextValue(item as LegacyTextItem, ['label', 'value']))
    .filter((item): item is string => Boolean(item))
    .map((label) => ({ label }))
}

export function normalizeHighlightItems(highlights: unknown): Array<{ text: string }> {
  if (!Array.isArray(highlights)) {
    return []
  }

  return highlights
    .map((item) => getTextValue(item as LegacyTextItem, ['text', 'value']))
    .filter((item): item is string => Boolean(item))
    .map((text) => ({ text }))
}

export function normalizeRecruiterItems(recruiters: unknown): Array<{ name: string }> {
  if (!Array.isArray(recruiters)) {
    return []
  }

  return recruiters
    .map((item) => getTextValue(item as LegacyTextItem, ['name', 'value']))
    .filter((item): item is string => Boolean(item))
    .map((name) => ({ name }))
}

export function getAboutParagraphs(about: unknown): string[] {
  if (!about || typeof about !== 'object') {
    return []
  }

  const maybeAbout = about as { para1?: unknown; para2?: unknown }

  return [maybeAbout.para1, maybeAbout.para2].filter(
    (paragraph): paragraph is string => typeof paragraph === 'string' && paragraph.trim().length > 0,
  )
}

export function renderPlainParagraphsToHtml(paragraphs: string[]): string {
  const html = paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('')

  return html ? sanitizeRichHtml(html) : ''
}

export function convertHtmlToRichText(args: {
  editorConfig?: EditorConfigLike
  html?: string | null
}): SerializedEditorState | null {
  const { editorConfig, html } = args

  if (!editorConfig || !html?.trim()) {
    return null
  }

  return convertHTMLToLexical({
    editorConfig,
    html: sanitizeRichHtml(html),
    JSDOM,
  })
}

export function convertParagraphsToRichText(args: {
  editorConfig?: EditorConfigLike
  paragraphs: string[]
}): SerializedEditorState | null {
  const html = renderPlainParagraphsToHtml(args.paragraphs)

  if (!html) {
    return null
  }

  return convertHtmlToRichText({
    editorConfig: args.editorConfig,
    html,
  })
}

export function renderRichTextToHtml(args: {
  content?: unknown
  fallbackHtml?: string | null
}): string {
  const { content, fallbackHtml } = args

  if (isRichTextState(content)) {
    return sanitizeRichHtml(
      convertLexicalToHTML({
        data: content,
        disableContainer: true,
      }),
    )
  }

  return fallbackHtml?.trim() ? sanitizeRichHtml(fallbackHtml) : ''
}