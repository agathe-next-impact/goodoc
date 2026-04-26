import { jwtVerify } from 'jose'

/**
 * Verifies a Payload-issued JWT (HS256, signed with PAYLOAD_SECRET).
 * Mirrors the verification done by Payload's own `JWTAuthentication`
 * strategy (`payload/dist/auth/strategies/jwt.js`) so the same cookie is
 * accepted by both apps.
 *
 * Returns the decoded `{ id, collection }` on success, `null` on any
 * failure. Edge-runtime safe — uses `jose` only, no Node crypto.
 */
export interface PayloadJwtPayload {
  id: string
  collection: string
}

export const PAYLOAD_TOKEN_COOKIE = 'payload-token'

export async function verifyPayloadJwt(
  token: string,
  secret: string,
): Promise<PayloadJwtPayload | null> {
  if (!token || !secret) return null
  try {
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify<PayloadJwtPayload>(token, secretKey)
    if (
      typeof payload.id !== 'string' ||
      typeof payload.collection !== 'string'
    ) {
      return null
    }
    return { id: payload.id, collection: payload.collection }
  } catch {
    return null
  }
}
