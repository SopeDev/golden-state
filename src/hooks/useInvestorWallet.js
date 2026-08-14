import { useCallback, useEffect, useState } from 'react'

/** Loads the investor returns wallet (balances, reinvest targets, activity). */
export const useInvestorWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const res = await fetch('/api/investor/wallet', { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      setWallet(await res.json())
    } catch {
      setFailed(true)
      setWallet(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { wallet, loading, failed, reload }
}
