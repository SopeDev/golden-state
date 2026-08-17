import { NextResponse } from 'next/server'

/** In-memory sliding window. Per process — enough for a single Node instance; replace with Redis/Upstash before multi-region production traffic. */

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

export const RATE_LIMITS = {
  loginIp: { limit: 10, windowMs: FIFTEEN_MINUTES_MS },
  loginEmail: { limit: 8, windowMs: FIFTEEN_MINUTES_MS },
  register: { limit: 5, windowMs: ONE_HOUR_MS },
  forgotPasswordIp: { limit: 5, windowMs: ONE_HOUR_MS },
  forgotPasswordEmail: { limit: 3, windowMs: ONE_HOUR_MS },
  resetPassword: { limit: 10, windowMs: FIFTEEN_MINUTES_MS },
  resendVerification: { limit: 5, windowMs: FIFTEEN_MINUTES_MS },
  contact: { limit: 8, windowMs: FIFTEEN_MINUTES_MS },
  workWithUs: { limit: 8, windowMs: FIFTEEN_MINUTES_MS },
  authPost: { limit: 30, windowMs: FIFTEEN_MINUTES_MS },
}

const hitsByKey = new Map()

const pruneHits = (key, now, windowMs) => {
  const hits = hitsByKey.get(key)
  if (!hits?.length) return []
  const fresh = hits.filter((timestamp) => now - timestamp < windowMs)
  if (fresh.length === 0) hitsByKey.delete(key)
  else hitsByKey.set(key, fresh)
  return fresh
}

export const getClientIp = (request) => {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export const consumeRateLimit = (key, limit, windowMs) => {
  const now = Date.now()
  const hits = pruneHits(key, now, windowMs)
  if (hits.length >= limit) {
    const retryAfterMs = hits[0] + windowMs - now
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }
  hits.push(now)
  hitsByKey.set(key, hits)
  return { ok: true, remaining: limit - hits.length }
}

export const tooManyRequestsResponse = (retryAfterSec) =>
  NextResponse.json(
    { message: 'Too many requests. Try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSec) },
    }
  )

export const enforceRateLimit = (request, bucket, { limit, windowMs, extraKey } = {}) => {
  const ip = getClientIp(request)
  const key = extraKey ? `${bucket}:${extraKey}:${ip}` : `${bucket}:${ip}`
  const result = consumeRateLimit(key, limit, windowMs)
  if (result.ok) return null
  return tooManyRequestsResponse(result.retryAfterSec)
}
