import { differenceInDays, parseISO, isValid } from 'date-fns'

export function daysLeft(dateStr) {
  if (!dateStr) return null
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  if (!isValid(d)) return null
  return differenceInDays(d, new Date())
}

export function alertLevel(dateStr) {
  const days = daysLeft(dateStr)
  if (days === null) return 'none'
  if (days <= 7) return 'red'
  if (days <= 14) return 'orange'
  return 'green'
}

export function AlertBadge({ date, label }) {
  const days = daysLeft(date)
  if (days === null) return <span className="badge-gray">Sin fecha</span>

  const level = days <= 7 ? 'red' : days <= 14 ? 'orange' : 'green'
  const emoji = level === 'red' ? '🔴' : level === 'orange' ? '🟠' : '🟢'

  let text
  if (days < 0) text = `Caducada (${Math.abs(days)}d)`
  else if (days === 0) text = 'Caduca hoy'
  else text = `${days}d`

  const cls = level === 'red' ? 'badge-red' : level === 'orange' ? 'badge-orange' : 'badge-green'

  return (
    <span className={cls} title={label}>
      {emoji} {text}
    </span>
  )
}

export function DateCell({ date, label }) {
  if (!date) return <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
  const days = daysLeft(date)
  const level = alertLevel(date)
  const colorClass =
    level === 'red' ? 'text-red-600 dark:text-red-400' :
    level === 'orange' ? 'text-orange-500 dark:text-orange-400' :
    'text-green-600 dark:text-green-400'

  const fmt = new Date(date).toLocaleDateString('es-ES')
  const emoji = level === 'red' ? '🔴' : level === 'orange' ? '🟠' : '🟢'

  return (
    <span className={`text-sm font-medium ${colorClass}`} title={label}>
      {emoji} {fmt}
    </span>
  )
}
