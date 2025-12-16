import { createClient } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'rwbjee-dataset',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'rwbjee-dataset',
})

export const urlFor = (source: SanityImageSource) => builder.image(source)