import { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { MonitorPlay, LogOut, Globe, Settings as SettingsIcon, PenTool, ListTodo } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AudioProvider } from './context/AudioContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { AuthUI } from './components/AuthUI'
import { KanbanBoard } from './components/KanbanBoard'
import { SettingsModal } from './components/SettingsModal'
import { FocusMode } from './components/FocusMode'
import { MusicPlayerModal } from './components/MusicPlayerModal'
import { NotesView } from './components/NotesView'
import { FlashcardsView } from './components/FlashcardsView'
import { StoreView } from './components/StoreView'
import { useProfile } from './hooks/useProfile'
import { BookOpen, Store, Coins } from 'lucide-react'

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
  const [isMusicOpen, setIsMusicOpen] = useState(false)

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
                {t('notes')}
              </Link>
              <Link
                to="/flashcards"
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/flashcards' ? 'bg-forge-800 text-[var(--color-text-main)] shadow-sm border border-forge-700' : 'text-gray-400 hover:text-[var(--color-text-main)] hover:bg-forge-800/50'}`}
              >
                <BookOpen size={16} className={location.pathname === '/flashcards' ? 'text-forge-accent' : ''} />
                {t('flashcards')}
              </Link>
              <Link
                to="/store"
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/store' ? 'bg-forge-800 text-[var(--color-text-main)] shadow-sm border border-forge-700' : 'text-gray-400 hover:text-[var(--color-text-main)] hover:bg-forge-800/50'}`}
              >
                <Store size={16} className={location.pathname === '/store' ? 'text-forge-accent' : ''} />
                Armory
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

              <div className="bg-forge-800 border border-yellow-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm transition-colors duration-500 cursor-help" title="Task Coins">
                <Coins size={14} className="text-yellow-400" />
                <span className="text-sm text-yellow-400 font-bold">{profile?.coins || 0}</span>
              </div>

              {/* Music Player Button */}
              <button
                onClick={() => setIsMusicOpen(true)}
                title="Audio Engine"
                className="w-9 h-9 rounded-full bg-forge-800 border border-forge-700 text-gray-400 hover:text-[var(--color-forge-accent)] hover:border-[var(--color-forge-accent)] transition-all flex items-center justify-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </button>

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
      <MusicPlayerModal isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} />
    </>
  )
}

function BottomNav({ onOpenMusic }) {
  const location = useLocation()
  const { session } = useAuth()
  const { t } = useLanguage()

  if (!session) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-forge-900 border-t border-forge-700 pb-safe z-[40]">
      <div className="flex items-center justify-around p-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-1/3 ${location.pathname === '/' ? 'text-forge-accent' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <ListTodo size={24} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-widest">{t('backlog')}</span>
        </Link>

        <div className="w-[1px] h-8 bg-forge-700/50"></div>

        <Link
          to="/store"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-1/5 ${location.pathname === '/store' ? 'text-forge-accent' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
          <span className="text-[10px] uppercase font-bold tracking-widest text-center truncate w-full">Store</span>
        </Link>

        <button
          onClick={onOpenMusic}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all w-1/4 text-gray-500 hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          <span className="text-[10px] uppercase font-bold tracking-widest">Radio</span>
        </button>

        <div className="w-[1px] h-8 bg-forge-700/50"></div>

        <Link
          to="/notes"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-1/4 ${location.pathname === '/notes' ? 'text-forge-accent' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <PenTool size={24} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-widest">{t('notes')}</span>
        </Link>

        <div className="w-[1px] h-8 bg-forge-700/50"></div>

        <Link
          to="/flashcards"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-1/4 ${location.pathname === '/flashcards' ? 'text-forge-accent' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <BookOpen size={24} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-widest flex-shrink-0 leading-none truncate w-full text-center">Decks</span>
        </Link>
      </div>
    </div>
  )
}

function AppContent() {
  const [isMusicOpenMobile, setIsMusicOpenMobile] = useState(false)

  return (
    <div className="min-h-screen bg-forge-900 text-[var(--color-text-main)] font-sans flex flex-col transition-colors duration-500">
      <GlobalNav />
      {/* Main Routing Area */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 flex-grow flex flex-col">
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
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <FlashcardsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <StoreView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav onOpenMusic={() => setIsMusicOpenMobile(true)} />
      <MusicPlayerModal isOpen={isMusicOpenMobile} onClose={() => setIsMusicOpenMobile(false)} />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AudioProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AudioProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
