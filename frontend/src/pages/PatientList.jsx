import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'
import PatientCard from '../components/PatientCard'
import { alertLevel } from '../components/AlertBadge'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'urgent', label: '🔴 Urgentes' },
  { id: 'opioids', label: 'Opioides' },
  { id: 'cognitive_severe', label: '🧠 Deterioro severo' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Baja/Fallecido' },
]

function hasUrgent(p) {
  const dates = [
    p.health_card_renewal,
    p.opioids && p.opioids_renewal,
    p.benzodiazepines && p.benzodiazepines_renewal,
    p.analytic_next_date,
  ].filter(Boolean)
  return dates.some(d => alertLevel(d) === 'red')
}

export default function PatientList() {
  const { residence } = useParams()
  const { patients, loading, error } = usePatients({ residence })
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('')

  let filtered = patients
  if (filter === 'urgent') filtered = patients.filter(hasUrgent)
  else if (filter === 'opioids') filtered = patients.filter(p => p.opioids)
  else if (filter === 'cognitive_severe') filtered = patients.filter(p => p.cognitive_impairment && p.cognitive_degree === 'severo')
  else if (filter === 'active') filtered = patients.filter(p => p.status === 'Activo')
  else if (filter === 'inactive') filtered = patients.filter(p => p.status !== 'Activo')

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏠 {residence}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {filtered.length} paciente{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/nuevo" className="btn-primary text-sm">+ Añadir paciente</Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-blue-700 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Cargando...</div>}
      {error && <div className="text-red-600 py-4">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          No hay pacientes con este filtro
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(p => (
          <PatientCard key={p.id} patient={p} />
        ))}
      </div>
    </div>
  )
}
