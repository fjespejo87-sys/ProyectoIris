import { getToken, clearToken } from '../hooks/useAuth'

const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    return
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error de servidor')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/patients${qs ? '?' + qs : ''}`)
  },
  searchPatients: (q) => request(`/api/patients/search?q=${encodeURIComponent(q)}`),
  getPatient: (id) => request(`/api/patients/${id}`),
  createPatient: (data) => request('/api/patients/', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),

  addNote: (patientId, content) =>
    request(`/api/patients/${patientId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteNote: (patientId, noteId) =>
    request(`/api/patients/${patientId}/notes/${noteId}`, { method: 'DELETE' }),

  getAlerts: () => request('/api/alerts/'),
  getAlertCount: () => request('/api/alerts/count'),
}
