import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import PatientForm from './pages/PatientForm'
import SearchResults from './pages/SearchResults'
import AlertsPage from './pages/AlertsPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <BrowserRouter>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <main className="pb-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/residencia/:residence" element={<PatientList />} />
              <Route path="/paciente/:id" element={<PatientDetail />} />
              <Route path="/paciente/:id/editar" element={<PatientForm />} />
              <Route path="/nuevo" element={<PatientForm />} />
              <Route path="/buscar" element={<SearchResults />} />
              <Route path="/alertas" element={<AlertsPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </div>
  )
}
