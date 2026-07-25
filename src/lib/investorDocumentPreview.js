export const isImageDocument = (doc) =>
  doc?.mimeType?.startsWith('image/') || /\.(jpe?g|png|webp|avif)$/i.test(doc?.fileName || '')

export const isPdfDocument = (doc) =>
  doc?.mimeType === 'application/pdf' || /\.pdf$/i.test(doc?.fileName || '')
