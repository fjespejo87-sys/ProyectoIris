import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts'
import { usePatients } from '../hooks/usePatients'
import { DateCell } from '../components/AlertBadge'

export default function Dashboard() {
  const { alerts, loading: alertsLoading } = useAlerts()
  const { patients: jg } = usePatients({ residence: 'Juan González', status: 'Activo' })
  const { patients: mons } = usePatients({ residence: 'Monsalve', status: 'Activo' })

  const urgent = (alerts || []).filter(a => a.level === 'red')
  const warning = (alerts || []).filter(a => a.level === 'orange')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Panel de control
      </h1>

      {/* Resumen de residencias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResidenceCard
          name="Juan González"
          total={(jg || []).length}
          href="/residencia/Juan González"
        />
        <ResidenceCard
          name="Monsalve"
          total={(mons || []).length}
          href="/residencia/Monsalve"
        />
      </div>

      {/* Alertas urgentes */}
      {alertsLoading ? (
        <div className="text-center py-8 text-gray-400">Cargando alertas...</div>
      ) : (
        <>
          {urgent.length > 0 && (
            <AlertSection
              title={`🔴 Urgente — ${urgent.length} renovación(es) a menos de 7 días o caducadas`}
              alerts={urgent}
              bg="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
            />
          )}
          {warning.length > 0 && (
            <AlertSection
              title={`🟠 Próximamente — ${warning.length} renovación(es) a menos de 14 días`}
              alerts={warning}
              bg="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800"
            />
          )}
          {urgent.length === 0 && warning.length === 0 && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500 dark:text-gray-400">Todo al día — no hay renovaciones urgentes en los próximos 14 días</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResidenceCard({ name, total, href }) {
  return (
    <Link to={href} className="card p-5 hover:shadow-md transition-shadow block">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏠</span>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} paciente{total !== 1 ? 's' : ''} activo{total !== 1 ? 's' : ''}</p>
        </div>
        <span className="ml-auto text-gray-300 dark:text-gray-600 text-xl">›</span>
      </div>
    </Link>
  )
}

function AlertSection({ title, alerts, bg }) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{title}</h2>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <Link
            key={i}
            to={`/paciente/${a.patient_id}`}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 hover:shadow-sm transition-shadow"
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{a.patient_name}</span>
              <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">· {a.residence}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">{a.field_label}</span>
              <DateCell date={a.date} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
