import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../hooks/usePatients'
import { DateCell } from '../components/AlertBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { api } from '../api/client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const statusStyle = {
  'Activo': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  'Baja temporal': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  'Fallecido': 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patient, loading, error, reload } = usePatient(id)
  const [newNote, setNewNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!patient) return null

  async function handleDeletePatient() {
    try {
      await api.deletePatient(patient.id)
      navigate('/')
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!newNote.trim()) return
    setSaving(true)
    try {
      await api.addNote(patient.id, newNote.trim())
      setNewNote('')
      reload()
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteNote() {
    if (!noteToDelete) return
    try {
      await api.deleteNote(patient.id, noteToDelete)
      setNoteToDelete(null)
      reload()
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—'
  const fmtAge = (d) => {
    if (!d) return null
    const birth = new Date(d)
    const age = new Date().getFullYear() - birth.getFullYear()
    return age
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {showDeleteConfirm && (
        <ConfirmDialog
          message={`¿Eliminar a ${patient.name}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeletePatient}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {noteToDelete && (
        <ConfirmDialog
          message="¿Eliminar esta nota?"
          onConfirm={handleDeleteNote}
          onCancel={() => setNoteToDelete(null)}
        />
      )}

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {patient.residence}
              {patient.birth_date && ` · ${fmtAge(patient.birth_date)} años`}
              {patient.birth_date && ` (${fmtDate(patient.birth_date)})`}
            </p>
            {patient.health_card_number && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Tarjeta: {patient.health_card_number}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusStyle[patient.status] || ''}`}>
              {patient.status}
            </span>
            <Link to={`/paciente/${patient.id}/editar`} className="btn-secondary text-sm">
              ✏️ Editar
            </Link>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Renovaciones */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📅 Renovaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tarjeta sanitaria">
            <DateCell date={patient.health_card_renewal} />
          </Field>
          {patient.opioids && (
            <Field label="Opioides">
              <DateCell date={patient.opioids_renewal} />
            </Field>
          )}
          {patient.benzodiazepines && (
            <Field label="Benzodiacepinas">
              <DateCell date={patient.benzodiazepines_renewal} />
            </Field>
          )}
          {patient.analytic_type && (
            <Field label={`Analítica (${patient.analytic_type})`}>
              <DateCell date={patient.analytic_next_date} />
            </Field>
          )}
        </div>
      </div>

      {/* Medicación y Cognitivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">💊 Medicación</h2>
          <div className="space-y-2 text-sm">
            <Row label="Opioides" value={patient.opioids ? 'Sí' : 'No'} />
            <Row label="Benzodiacepinas" value={patient.benzodiazepines ? 'Sí' : 'No'} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🧠 Deterioro cognitivo</h2>
          <div className="space-y-2 text-sm">
            <Row label="Presente" value={patient.cognitive_impairment ? 'Sí' : 'No'} />
            {patient.cognitive_impairment && (
              <>
                <Row label="Grado" value={patient.cognitive_degree || '—'} />
                <Row label="Tipo" value={patient.cognitive_type || '—'} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Historial de renovaciones */}
      {patient.renewal_history && patient.renewal_history.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Historial de renovaciones</h2>
          <div className="space-y-2">
            {patient.renewal_history.slice().reverse().map(h => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">
                  {new Date(h.changed_at).toLocaleDateString('es-ES')}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{h.field_name}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{fmtDate(h.old_date)}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-blue-700 dark:text-blue-400">{fmtDate(h.new_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📝 Notas</h2>

        <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Añadir nota..."
            className="input flex-1"
          />
          <button type="submit" disabled={saving} className="btn-primary shrink-0">
            {saving ? '...' : 'Guardar'}
          </button>
        </form>

        {patient.notes && patient.notes.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Sin notas todavía</p>
        )}

        <div className="space-y-3">
          {patient.notes && patient.notes.map(note => (
            <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {new Date(note.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
              </div>
              <button
                onClick={() => setNoteToDelete(note.id)}
                className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 shrink-0 text-lg leading-none"
                title="Eliminar nota"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <div>{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  )
}
