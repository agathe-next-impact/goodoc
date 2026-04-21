'use server'

/**
 * Verifies that a Doctolib URL is accessible via a HEAD request.
 * Runs server-side to avoid CORS issues.
 * Called from the practitioner dashboard to alert on broken links.
 */
export async function checkDoctolibUrl(
  url: string,
): Promise<{ valid: boolean; statusCode: number }> {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('doctolib.fr')) {
      return { valid: false, statusCode: 0 }
    }

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    })

    return {
      valid: response.ok,
      statusCode: response.status,
    }
  } catch {
    return { valid: false, statusCode: 0 }
  }
}
