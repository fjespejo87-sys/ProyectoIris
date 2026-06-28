import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlertCount } from '../hooks/useAlerts'
import { clearToken } from '../hooks/useAuth'

export default function Navbar({ darkMode, setDarkMode }) {
  const { count } = useAlertCount()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-blue-700 dark:bg-blue-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏥</span>
          <span className="text-white font-bold text-lg hidden sm:block">Iris</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente o tarjeta sanitaria..."
              className="w-full rounded-lg pl-4 pr-10 py-2 text-sm text-gray-900 bg-white dark:bg-gray-700 dark:text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              🔍
            </button>
          </div>
        </form>

        {/* Nav links */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <Link to="/" className="text-blue-100 hover:text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors">
            Inicio
          </Link>
          <Link to="/residencia/Juan González" className="text-blue-100 hover:text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors hidden md:block">
            Juan González
          </Link>
          <Link to="/residencia/Monsalve" className="text-blue-100 hover:text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors hidden md:block">
            Monsalve
          </Link>

          {/* Alert bell */}
          <Link to="/alertas" className="relative p-2 text-white hover:bg-blue-600 rounded-lg transition-colors">
            <span className="text-xl">🔔</span>
            {count.urgent > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count.urgent > 9 ? '9+' : count.urgent}
              </span>
            )}
          </Link>

          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-white hover:bg-blue-600 rounded-lg transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/nuevo" className="ml-1 bg-white text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-50 transition-colors">
            + Paciente
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors text-sm"
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  )
}
