import { Link } from 'react-router-dom'
import { alertLevel, daysLeft } from './AlertBadge'

function worstLevel(patient) {
  const dates = [
    patient.health_card_renewal,
    patient.opioids && patient.opioids_renewal,
    patient.benzodiazepines && patient.benzodiazepines_renewal,
    patient.analytic_next_date,
  ].filter(Boolean)

  let worst = 'none'
  for (const d of dates) {
    const lv = alertLevel(d)
    if (lv === 'red') return 'red'
    if (lv === 'orange') worst = 'orange'
    else if (worst === 'none' && lv === 'green') worst = 'green'
  }
  return worst
}

const borderColor = {
  red: 'border-l-4 border-l-red-500',
  orange: 'border-l-4 border-l-orange-400',
  green: 'border-l-4 border-l-green-500',
  none: 'border-l-4 border-l-gray-200 dark:border-l-gray-600',
}

const statusColor = {
  'Activo': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  'Baja temporal': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  'Fallecido': 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

export default function PatientCard({ patient }) {
  const level = worstLevel(patient)
  const border = borderColor[level] || borderColor.none

  return (
    <Link
      to={`/paciente/${patient.id}`}
      className={`card p-4 flex items-center gap-4 hover:shadow-md transition-shadow ${border} block`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[patient.status] || statusColor['Activo']}`}>
            {patient.status}
          </span>
          {patient.cognitive_impairment && (
            <span className="badge-gray">🧠 {patient.cognitive_degree || 'Deterioro cognitivo'}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{patient.residence}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {patient.health_card_renewal && (
            <MiniAlert label="Tarjeta" date={patient.health_card_renewal} />
          )}
          {patient.opioids && patient.opioids_renewal && (
            <MiniAlert label="Opioides" date={patient.opioids_renewal} />
          )}
          {patient.benzodiazepines && patient.benzodiazepines_renewal && (
            <MiniAlert label="Benzo." date={patient.benzodiazepines_renewal} />
          )}
          {patient.analytic_next_date && (
            <MiniAlert label="Analítica" date={patient.analytic_next_date} />
          )}
        </div>
      </div>
      <span className="text-gray-300 dark:text-gray-600 text-xl shrink-0">›</span>
    </Link>
  )
}

function MiniAlert({ label, date }) {
  const level = alertLevel(date)
  const days = daysLeft(date)
  if (level === 'green') return null // solo mostrar alertas en tarjeta

  const emoji = level === 'red' ? '🔴' : '🟠'
  const cls = level === 'red' ? 'badge-red' : 'badge-orange'
  const text = days !== null && days < 0 ? `${label}: caducada` : `${label}: ${days}d`

  return <span className={cls}>{emoji} {text}</span>
}
