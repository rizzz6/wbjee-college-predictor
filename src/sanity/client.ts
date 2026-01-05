import { createClient } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { apiVersion, dataset, projectId } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

const builder = createImageUrlBuilder({
  projectId,
  dataset,
})

export const urlFor = (source: SanityImageSource) => builder.image(source)