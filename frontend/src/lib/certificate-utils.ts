/**
 * Certificate Media & PDF Utility
 * Handles reliable detection, thumbnail extraction, and embedded preview of certificate documents.
 */

/**
 * Detects if a URL points to a PDF document.
 */
export function isPdfDocument(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    /\.pdf($|\?)/i.test(clean) ||
    clean.includes('application/pdf') ||
    clean.includes('/raw/upload/') ||
    (clean.includes('res.cloudinary.com') && clean.includes('.pdf'))
  );
}

/**
 * Generates an image preview thumbnail URL for a certificate.
 * - For images: returns the image URL.
 * - For Cloudinary PDFs: transforms page 1 into a high-resolution JPG image so the
 *   certificate graphic/badge inside the PDF is visibly rendered directly!
 */
export function getCertificateThumbnailUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If it's not a PDF, it's already an image
  if (!isPdfDocument(trimmed)) {
    return trimmed;
  }

  // Cloudinary dynamic document-to-image transformation:
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/file.pdf
  // ->   https://res.cloudinary.com/<cloud>/image/upload/pg_1,f_auto,q_auto/v123/file.jpg
  if (trimmed.includes('res.cloudinary.com')) {
    if (trimmed.includes('/raw/upload/')) {
      // Convert legacy raw uploads to image pipeline with page 1 JPG rasterization
      let transformed = trimmed.replace('/raw/upload/', '/image/upload/pg_1,f_auto,q_auto/');
      if (!transformed.toLowerCase().endsWith('.jpg') && !transformed.toLowerCase().endsWith('.png')) {
        transformed = `${transformed.replace(/\.pdf$/i, '')}.jpg`;
      }
      return transformed;
    }

    if (trimmed.includes('/image/upload/')) {
      return trimmed
        .replace('/image/upload/', '/image/upload/pg_1,f_auto,q_auto/')
        .replace(/\.pdf$/i, '.jpg');
    }
  }

  return null;
}

/**
 * Generates an embedded PDF reader URL using Google Docs Viewer engine.
 * Ensures cross-origin, cross-device (Safari/Chrome/Edge/iOS/Android) rendering
 * without triggering browser download blockers or raw MIME-type rejections.
 */
export function getPdfViewerUrl(url: string): string {
  if (!url) return '';
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}
