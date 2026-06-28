import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY = {
  name: '',
  residence: 'Juan González',
  birth_date: '',
  health_card_number: '',
  health_card_renewal: '',
  opioids: false,
  opioids_renewal: '',
  benzodiazepines: false,
  benzodiazepines_renewal: '',
  analytic_type: '',
  analytic_last_date: '',
  analytic_next_date: '',
  cognitive_impairment: false,
  cognitive_degree: '',
  cognitive_type: '',
  status: 'Activo',
}

function toForm(patient) {
  const fmt = (d) => d ? d.substring(0, 10) : ''
  return {
    name: patient.name || '',
    residence: patient.residence || 'Juan González',
    birth_date: fmt(patient.birth_date),
    health_card_number: patient.health_card_number || '',
    health_card_renewal: fmt(patient.health_card_renewal),
    opioids: patient.opioids || false,
    opioids_renewal: fmt(patient.opioids_renewal),
    benzodiazepines: patient.benzodiazepines || false,
    benzodiazepines_renewal: fmt(patient.benzodiazepines_renewal),
    analytic_type: patient.analytic_type || '',
    analytic_last_date: fmt(patient.analytic_last_date),
    analytic_next_date: fmt(patient.analytic_next_date),
    cognitive_impairment: patient.cognitive_impairment || false,
    cognitive_degree: patient.cognitive_degree || '',
    cognitive_type: patient.cognitive_type || '',
    status: patient.status || 'Activo',
  }
}

function toPayload(form) {
  const nullDate = (d) => d || null
  return {
    ...form,
    birth_date: nullDate(form.birth_date),
    health_card_renewal: nullDate(form.health_card_renewal),
    opioids_renewal: nullDate(form.opioids_renewal),
    benzodiazepines_renewal: nullDate(form.benzodiazepines_renewal),
    analytic_last_date: nullDate(form.analytic_last_date),
    analytic_next_date: nullDate(form.analytic_next_date),
  }
}

export default function PatientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [original, setOriginal] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    api.getPatient(id)
      .then(p => {
        const f = toForm(p)
        setForm(f)
        setOriginal(f)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function tryNavigate(path) {
    if (isDirty) {
      setPendingNav(path)
      setShowExitConfirm(true)
    } else {
      navigate(path)
    }
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('El nombre es obligatorio')
    setSaving(true)
    setError(null)
    try {
      const payload = toPayload(form)
      if (isEdit) {
        await api.updatePatient(id, payload)
        navigate(`/paciente/${id}`)
      } else {
        const p = await api.createPatient(payload)
        navigate(`/paciente/${p.id}`)
      }
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {showExitConfirm && (
        <ConfirmDialog
          message="Tienes cambios sin guardar. ¿Salir de todas formas?"
          onConfirm={() => navigate(pendingNav)}
          onCancel={() => { setShowExitConfirm(false); setPendingNav(null) }}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => tryNavigate(isEdit ? `/paciente/${id}` : '/')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos personales */}
        <Section title="Datos personales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre completo *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Residencia *</label>
              <select className="input" value={form.residence} onChange={e => set('residence', e.target.value)}>
                <option>Juan González</option>
                <option>Monsalve</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input type="date" className="input" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} />
            </div>
            <div>
              <label className="label">Nº tarjeta sanitaria</label>
              <input className="input" value={form.health_card_number} onChange={e => set('health_card_number', e.target.value)} />
            </div>
            <div>
              <label className="label">Renovación tarjeta sanitaria</label>
              <input type="date" className="input" value={form.health_card_renewal} onChange={e => set('health_card_renewal', e.target.value)} />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Activo</option>
                <option>Baja temporal</option>
                <option>Fallecido</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Opioides */}
        <Section title="Opioides">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.opioids}
              onChange={e => set('opioids', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">El paciente tiene opioides prescritos</span>
          </label>
          {form.opioids && (
            <div className="mt-3">
              <label className="label">Fecha de renovación</label>
              <input type="date" className="input" value={form.opioids_renewal} onChange={e => set('opioids_renewal', e.target.value)} />
            </div>
          )}
        </Section>

        {/* Benzodiacepinas */}
        <Section title="Benzodiacepinas">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.benzodiazepines}
              onChange={e => set('benzodiazepines', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">El paciente tiene benzodiacepinas prescritas</span>
          </label>
          {form.benzodiazepines && (
            <div className="mt-3">
              <label className="label">Fecha de renovación</label>
              <input type="date" className="input" value={form.benzodiazepines_renewal} onChange={e => set('benzodiazepines_renewal', e.target.value)} />
            </div>
          )}
        </Section>

        {/* Analítica */}
        <Section title="Analítica">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de analítica</label>
              <select className="input" value={form.analytic_type} onChange={e => set('analytic_type', e.target.value)}>
                <option value="">— Sin analítica —</option>
                <option value="anual">Anual</option>
                <option value="semestral">Semestral</option>
                <option value="fecha_fija">Fecha fija</option>
              </select>
            </div>

            {form.analytic_type && form.analytic_type !== 'fecha_fija' && (
              <div>
                <label className="label">Última analítica (calcula la próxima)</label>
                <input type="date" className="input" value={form.analytic_last_date} onChange={e => set('analytic_last_date', e.target.value)} />
              </div>
            )}

            {form.analytic_type === 'fecha_fija' && (
              <div>
                <label className="label">Fecha de la próxima analítica</label>
                <input type="date" className="input" value={form.analytic_next_date} onChange={e => set('analytic_next_date', e.target.value)} />
              </div>
            )}
          </div>
        </Section>

        {/* Deterioro cognitivo */}
        <Section title="Deterioro cognitivo">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.cognitive_impairment}
              onChange={e => set('cognitive_impairment', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Presenta deterioro cognitivo</span>
          </label>
          {form.cognitive_impairment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="label">Grado</label>
                <select className="input" value={form.cognitive_degree} onChange={e => set('cognitive_degree', e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="severo">Severo</option>
                </select>
              </div>
              <div>
                <label className="label">Tipo (Alzheimer, demencia, vascular...)</label>
                <input
                  className="input"
                  value={form.cognitive_type}
                  onChange={e => set('cognitive_type', e.target.value)}
                  placeholder="Ej: Alzheimer"
                />
              </div>
            </div>
          )}
        </Section>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => tryNavigate(isEdit ? `/paciente/${id}` : '/')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}
