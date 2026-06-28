import { Link } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts'
import { DateCell } from '../components/AlertBadge'

export default function AlertsPage() {
  const { alerts, loading } = useAlerts()
  const urgent = alerts.filter(a => a.level === 'red')
  const warning = alerts.filter(a => a.level === 'orange')

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔔 Todas las alertas</h1>

      {loading && <div className="text-center py-12 text-gray-400">Cargando alertas...</div>}

      {!loading && alerts.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500">No hay renovaciones urgentes en los próximos 14 días</p>
        </div>
      )}

      {urgent.length > 0 && (
        <Section
          title={`🔴 Urgentes (${urgent.length})`}
          alerts={urgent}
          headerClass="bg-red-700"
        />
      )}

      {warning.length > 0 && (
        <div className="mt-4">
          <Section
            title={`🟠 Próximamente (${warning.length})`}
            alerts={warning}
            headerClass="bg-orange-500"
          />
        </div>
      )}
    </div>
  )
}

function Section({ title, alerts, headerClass }) {
  return (
    <div className="card overflow-hidden">
      <div className={`${headerClass} text-white px-4 py-3 font-semibold`}>{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Paciente</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Residencia</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Qué renovar</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {alerts.map((a, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
              <td className="px-4 py-3">
                <Link to={`/paciente/${a.patient_id}`} className="font-medium text-blue-700 dark:text-blue-400 hover:underline">
                  {a.patient_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{a.residence}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.field_label}</td>
              <td className="px-4 py-3"><DateCell date={a.date} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
