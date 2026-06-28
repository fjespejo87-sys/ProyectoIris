import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function useAlertCount() {
  const [count, setCount] = useState({ total: 0, urgent: 0 })

  const refresh = () => {
    api.getAlertCount()
      .then(setCount)
      .catch(() => {})
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60000)
    return () => clearInterval(id)
  }, [])

  return { count, refresh }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAlerts()
      .then(data => setAlerts(data || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  return { alerts, loading }
}
