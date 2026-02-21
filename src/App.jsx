import { Routes, Route, Navigate } from 'react-router-dom'
import { MonitorPlay, LogOut, Globe } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { AuthUI } from './components/AuthUI'
import { KanbanBoard } from './components/KanbanBoard'
import { useProfile } from './hooks/useProfile'

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/auth" replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const { session } = useAuth()
  if (session) {
    return <Navigate to="/" replace />
  }
  return children
}

function GlobalNav() {
  const { session, signOut } = useAuth()
  const { profile } = useProfile()
  const { t, lang, toggleLanguage } = useLanguage()

  const currentLevel = profile?.level || 1

  return (
    <nav className="px-6 py-4 flex justify-between items-center bg-forge-900 sticky top-0 z-50 border-b border-forge-800">
      {/* Brand Logo - YouTube/Netflix style */}
      <div className="flex items-center gap-2 text-white font-bold tracking-tight text-xl">
        <MonitorPlay className="text-forge-accent" fill="currentColor" size={28} />
        <span>{t('appTitle')}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          title="Switch Language"
        >
          <Globe size={18} />
          <span className="uppercase">{lang}</span>
        </button>

        {session && (
          <div className="flex items-center gap-4">
            {/* Simple Level Badge */}
            <div className="bg-forge-800 border border-forge-700 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
              <span className="text-xs text-gray-400 font-medium">{t('lvl')}</span>
              <span className="text-sm text-forge-xp font-bold">{currentLevel}</span>
            </div>

            {/* Avatar / Logout */}
            <button
              onClick={signOut}
              title={t('logout')}
              className="w-9 h-9 rounded-full bg-forge-800 border border-forge-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-forge-accent transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-forge-900 text-white font-sans flex flex-col">
      <GlobalNav />
      {/* Main Routing Area */}
      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthUI />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
