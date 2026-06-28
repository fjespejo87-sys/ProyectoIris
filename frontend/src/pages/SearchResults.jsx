import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import PatientCard from '../components/PatientCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    api.searchPatients(q)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Búsqueda: <span className="text-blue-700 dark:text-blue-400">"{q}"</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
      </p>

      {!loading && results.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          No se encontraron pacientes
        </div>
      )}

      <div className="space-y-2">
        {results.map(p => <PatientCard key={p.id} patient={p} />)}
      </div>
    </div>
  )
}
