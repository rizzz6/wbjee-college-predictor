
/**
 * Supabase Image Loader for Next.js
 * 
 * This loader transforms image requests into Supabase Storage transformation URLs.
 * Documentation: https://supabase.com/docs/guides/storage/serving/image-transformations#nextjs-loader
 */

const projectId = 'odahbrkrhaturgyiuutu'; // Extracted from your Supabase URL

interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function supabaseLoader({ src, width, quality }: LoaderProps) {
  // src will be the full URL from Payload, e.g.,
  // https://odahbrkrhaturgyiuutu.supabase.co/storage/v1/object/public/colleges-media/jgec-logo.png
  
  // We need to extract the path after /public/
  // Result should be: colleges-media/jgec-logo.png
  const path = src.split('/public/')[1];
  
  // If the src doesn't contain /public/, it's likely a local asset or external, 
  // so we return it as-is
  if (!path) return src;

  const params = [`width=${width}`, `quality=${quality || 75}`];
  
  // Supabase automatically handles WebP/AVIF format detection based on 'Accept' header
  // so we don't need to append &format=webp unless we want to force it.
  
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${path}?${params.join('&')}`;
}
