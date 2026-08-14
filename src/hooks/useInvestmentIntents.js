import { useCallback, useEffect, useState } from 'react'

/** Intent statuses the investor should still see on the activity page. */
export const VISIBLE_INTENT_STATUSES = [
  'MEETING_REQUESTED',
  'AWAITING_WIRE',
  'COMPLETED',
  'CANCELLED',
]

/** Loads the signed-in investor's investment requests. */
export const useInvestmentIntents = () => {
  const [intents, setIntents] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const reload = useCallback(async () => {
    setFailed(false)
    try {
      const res = await fetch('/api/investor/investment-intents', { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setIntents(list.filter((row) => VISIBLE_INTENT_STATUSES.includes(row.status)))
    } catch {
      setFailed(true)
      setIntents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { intents, loading, failed, reload }
}
