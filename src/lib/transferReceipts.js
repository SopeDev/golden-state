import { putPrivateObject } from '@/lib/storage/r2'

export const ALLOWED_RECEIPT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export function validateReceiptFile(receipt) {
  if (!(receipt instanceof File) || receipt.size <= 0) {
    return { error: 'A bank notice photo or PDF is required' }
  }
  if (!ALLOWED_RECEIPT_TYPES.has(receipt.type)) {
    return { error: 'Bank notice must be PDF, JPG, PNG, or WebP' }
  }
  return { error: null }
}

export async function storeTransferReceipt({ prefix, userId, file }) {
  const extension = file.name.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : 'bin'
  const objectKey = `${prefix}/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`
  const bytes = await file.arrayBuffer()
  await putPrivateObject({
    key: objectKey,
    body: Buffer.from(bytes),
    contentType: file.type,
  })
  return {
    receiptStorageKey: objectKey,
    receiptFileName: file.name,
    receiptMimeType: file.type,
  }
}
