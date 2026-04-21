'use client'

import { useCallback, useEffect, useState } from 'react'

import { checkDoctolibUrl } from '../actions/check-doctolib'

type DoctolibStatus = 'valid' | 'invalid' | 'checking' | 'unconfigured'

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useDoctolibStatus(doctolibUrl: string | null): {
  status: DoctolibStatus
  lastChecked: Date | null
} {
  const [status, setStatus] = useState<DoctolibStatus>(
    doctolibUrl ? 'checking' : 'unconfigured',
  )
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const check = useCallback(async () => {
    if (!doctolibUrl) {
      setStatus('unconfigured')
      return
    }

    setStatus('checking')
    try {
      const result = await checkDoctolibUrl(doctolibUrl)
      setStatus(result.valid ? 'valid' : 'invalid')
      setLastChecked(new Date())
    } catch {
      setStatus('invalid')
      setLastChecked(new Date())
    }
  }, [doctolibUrl])

  useEffect(() => {
    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [check])

  return { status, lastChecked }
}
