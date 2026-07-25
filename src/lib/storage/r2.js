import { mkdir, writeFile, readFile } from 'fs/promises'
import path from 'path'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const isLocalStorageDriver = () => {
  if (process.env.STORAGE_DRIVER === 'local') return true
  if (process.env.STORAGE_DRIVER === 'r2') return false
  // Dev convenience: skip R2 unless explicitly requested
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

const localRoot = () => path.join(process.cwd(), 'public', 'uploads')

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

/**
 * Upload a private investor document. Returns the object key stored in DB.
 */
export const putPrivateObject = async ({ key, body, contentType }) => {
  if (isLocalStorageDriver()) {
    const filePath = path.join(localRoot(), key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
    return key
  }

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv('R2_BUCKET_PRIVATE'),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return key
}

/**
 * Read a private object by key. Returns { body: Buffer, contentType }.
 */
export const getPrivateObject = async (key) => {
  if (isLocalStorageDriver()) {
    const filePath = path.join(localRoot(), key)
    const body = await readFile(filePath)
    return { body, contentType: null }
  }

  const client = getS3Client()
  const result = await client.send(
    new GetObjectCommand({
      Bucket: requireEnv('R2_BUCKET_PRIVATE'),
      Key: key,
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
  if (isLocalStorageDriver()) {
    const filePath = path.join(localRoot(), key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
    return `/uploads/${key}`
  }

  const client = getS3Client()
  const bucket = requireEnv('R2_BUCKET_PUBLIC')
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )

  const baseUrl = requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '')
  return `${baseUrl}/${key}`
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
