import { SignJWT } from 'jose'
import { describe, expect, it } from 'vitest'

import { verifyPayloadJwt } from './auth'

const SECRET = 'a'.repeat(64)

async function signToken(payload: Record<string, unknown>, secret = SECRET) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret))
}

describe('verifyPayloadJwt', () => {
  it('returns payload for a token signed with the matching secret', async () => {
    const token = await signToken({ id: 'user-123', collection: 'users' })
    const decoded = await verifyPayloadJwt(token, SECRET)
    expect(decoded).toEqual({ id: 'user-123', collection: 'users' })
  })

  it('returns null when the secret does not match', async () => {
    const token = await signToken({ id: 'user-123', collection: 'users' })
    expect(await verifyPayloadJwt(token, 'b'.repeat(64))).toBeNull()
  })

  it('returns null on an empty token', async () => {
    expect(await verifyPayloadJwt('', SECRET)).toBeNull()
  })

  it('returns null on a malformed token', async () => {
    expect(await verifyPayloadJwt('not-a-jwt', SECRET)).toBeNull()
  })

  it('returns null when payload misses id or collection', async () => {
    const tokenA = await signToken({ collection: 'users' })
    const tokenB = await signToken({ id: 'user-123' })
    expect(await verifyPayloadJwt(tokenA, SECRET)).toBeNull()
    expect(await verifyPayloadJwt(tokenB, SECRET)).toBeNull()
  })

  it('returns null when the token is expired', async () => {
    const expired = await new SignJWT({ id: 'u', collection: 'users' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(SECRET))
    expect(await verifyPayloadJwt(expired, SECRET)).toBeNull()
  })
})
