import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function usePatients(params = {}) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    api.getPatients(params)
      .then(data => setPatients(data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [JSON.stringify(params)])

  return { patients, loading, error, reload: load }
}

export function usePatient(id) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    if (!id) return
    setLoading(true)
    api.getPatient(id)
      .then(setPatient)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  return { patient, loading, error, reload: load }
}
