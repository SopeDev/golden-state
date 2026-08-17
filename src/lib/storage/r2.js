import { mkdir, writeFile, readFile } from 'fs/promises'
import path from 'path'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const isLocalStorageDriver = () => {
  if (process.env.STORAGE_DRIVER === 'local') return true
  if (process.env.STORAGE_DRIVER === 'r2') return false
  return process.env.NODE_ENV !== 'production'
}

const requireEnv = (name) => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

let s3Client = null

const getS3Client = () => {
  if (s3Client) return s3Client

  const accountId = requireEnv('R2_ACCOUNT_ID')
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  })
  return s3Client
}

const localPrivateRoot = () => path.join(process.cwd(), 'storage', 'private')
const localPublicRoot = () => path.join(process.cwd(), 'public', 'uploads')
const legacyPublicRoot = () => path.join(process.cwd(), 'public', 'uploads')

const normalizeObjectKey = (key) => {
  const raw = String(key || '')
    .replace(/^\/uploads\//, '')
    .replace(/^\/+/, '')
  if (!raw || raw.includes('..') || path.isAbsolute(raw)) {
    throw new Error('Invalid storage key')
  }
  return raw
}

const resolveInsideRoot = (rootDir, key) => {
  const root = path.resolve(rootDir)
  const resolved = path.resolve(root, key)
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new Error('Invalid storage key')
  }
  return resolved
}

const streamToBuffer = async (body) => {
  if (!body) return Buffer.alloc(0)
  if (Buffer.isBuffer(body)) return body
  if (typeof body.transformToByteArray === 'function') {
    return Buffer.from(await body.transformToByteArray())
  }

  const chunks = []
  for await (const chunk of body) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const readLocalPrivateFile = async (key) => {
  const privatePath = resolveInsideRoot(localPrivateRoot(), key)
  try {
    return await readFile(privatePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const legacyPath = resolveInsideRoot(legacyPublicRoot(), key)
  return readFile(legacyPath)
}

/**
 * Upload a private investor document. Returns the object key stored in DB.
 */
export const putPrivateObject = async ({ key, body, contentType }) => {
  const objectKey = normalizeObjectKey(key)

  if (isLocalStorageDriver()) {
    const filePath = resolveInsideRoot(localPrivateRoot(), objectKey)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
    return objectKey
  }

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv('R2_BUCKET_PRIVATE'),
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  )
  return objectKey
}

/**
 * Read a private object by key. Returns { body: Buffer, contentType }.
 */
export const getPrivateObject = async (key) => {
  const objectKey = normalizeObjectKey(key)

  if (isLocalStorageDriver()) {
    const body = await readLocalPrivateFile(objectKey)
    return { body, contentType: null }
  }

  const client = getS3Client()
  const result = await client.send(
    new GetObjectCommand({
      Bucket: requireEnv('R2_BUCKET_PRIVATE'),
      Key: objectKey,
    })
  )

  return {
    body: await streamToBuffer(result.Body),
    contentType: result.ContentType || null,
  }
}

/**
 * Upload a public marketing asset. Returns a URL suitable for <img src>.
 */
export const putPublicObject = async ({ key, body, contentType }) => {
  const objectKey = normalizeObjectKey(key)
  if (objectKey.startsWith('investors/')) {
    throw new Error('Investor files cannot use public storage')
  }

  if (isLocalStorageDriver()) {
    const filePath = resolveInsideRoot(localPublicRoot(), objectKey)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
    return `/uploads/${objectKey}`
  }

  const client = getS3Client()
  const bucket = requireEnv('R2_BUCKET_PUBLIC')
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  )

  const baseUrl = requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '')
  return `${baseUrl}/${objectKey}`
}

/** Client-facing URL for authenticated document preview/download. */
export const investorDocumentClientUrl = (documentId) =>
  `/api/investor-documents/${documentId}`

export const toClientInvestorDocument = (doc) => {
  if (!doc) return doc
  return {
    ...doc,
    fileUrl: investorDocumentClientUrl(doc.id),
  }
}

export const toClientInvestorDocuments = (docs) =>
  Array.isArray(docs) ? docs.map(toClientInvestorDocument) : docs
