import { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { MonitorPlay, LogOut, Globe, Settings as SettingsIcon, PenTool } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthUI } from './components/AuthUI'
import { KanbanBoard } from './components/KanbanBoard'
import { SettingsModal } from './components/SettingsModal'
import { FocusMode } from './components/FocusMode'
import { NotesView } from './components/NotesView'
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
  const { session } = useAuth()
  const { profile } = useProfile()
  const { t, lang, toggleLanguage } = useLanguage()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFocusOpen, setIsFocusOpen] = useState(false)

  const currentLevel = profile?.level || 1
  const location = useLocation()

  return (
    <>
      <nav className="px-6 py-4 flex justify-between items-center bg-forge-900 sticky top-0 z-50 border-b border-forge-700 transition-colors duration-500">
        {/* Brand Logo - YouTube/Netflix style */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-[var(--color-text-main)] font-bold tracking-tight text-xl hover:scale-105 transition-transform duration-300">
            <MonitorPlay className="text-forge-accent" fill="currentColor" size={28} />
            <span className="hidden sm:inline-block">{t('appTitle')}</span>
          </Link>

          {session && (
            <div className="hidden md:flex gap-1 ml-4 border-l border-forge-700 pl-6">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-forge-800 text-[var(--color-text-main)] shadow-sm' : 'text-gray-400 hover:text-[var(--color-text-main)] hover:bg-forge-800/50'}`}
              >
                Kanban Board
              </Link>
              <Link
                to="/notes"
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/notes' ? 'bg-forge-800 text-[var(--color-text-main)] shadow-sm border border-forge-700' : 'text-gray-400 hover:text-[var(--color-text-main)] hover:bg-forge-800/50'}`}
              >
                <PenTool size={16} className={location.pathname === '/notes' ? 'text-forge-accent' : ''} />
                Noteit
              </Link>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[var(--color-text-main)] transition-colors hidden sm:flex"
            title="Switch Language"
          >
            <Globe size={18} />
            <span className="uppercase">{lang}</span>
          </button>

          {session && (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Simple Level Badge */}
              <div className="bg-forge-800 border border-forge-700 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm transition-colors duration-500">
                <span className="text-xs text-gray-400 font-medium">{t('lvl')}</span>
                <span className="text-sm text-forge-xp font-bold">{currentLevel}</span>
              </div>

              {/* Focus Mode Button */}
              <button
                onClick={() => setIsFocusOpen(true)}
                title="Focus Mode (Pomodoro)"
                className="w-9 h-9 rounded-full bg-forge-800 border border-forge-700 text-gray-400 hover:text-[var(--color-forge-accent)] hover:border-[var(--color-forge-accent)] transition-all flex items-center justify-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>
              </button>

              {/* Settings Modal Trigger (Avatar style) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Profile & Themes"
                className="w-9 h-9 rounded-full bg-forge-800 border border-forge-700 p-0.5 hover:border-forge-accent transition-all overflow-hidden flex items-center justify-center shadow-lg"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <SettingsIcon size={18} className="text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <FocusMode isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />
    </>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-forge-900 text-[var(--color-text-main)] font-sans flex flex-col transition-colors duration-500">
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
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesView />
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
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
