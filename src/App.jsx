import { Routes, Route, Navigate } from 'react-router-dom'
import { Terminal, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
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


function AppContent() {
  const { session, signOut, user } = useAuth()
  const { profile } = useProfile()

  // Calculate generic base XP logic based on mathematical levels
  const currentXP = profile?.xp || 0
  const currentLevel = profile?.level || 1

  // Base XP formula we implemented (level is floor(TotalXP / 1000) + 1)
  const baseXPForLevel = (currentLevel - 1) * 1000
  const nextLevelXP = currentLevel * 1000
  // Relative XP to show on progress UI 
  const relativeXpInLevel = currentXP - baseXPForLevel

  return (
    <div className="min-h-screen bg-forge-900 text-white font-sans selection:bg-forge-accent selection:text-forge-900 flex flex-col">
      {/* Global Navigation Shell */}
      <nav className="p-4 border-b border-forge-800 flex justify-between items-center bg-forge-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-forge-accent transition-transform hover:scale-105 duration-300 cursor-pointer">
          <Terminal size={28} className="drop-shadow-neon" />
          <span className="font-mono font-bold tracking-widest text-lg drop-shadow-neon hidden sm:inline-block">
            THE FORGE
          </span>
        </div>

        <div className="flex gap-4 sm:gap-6 items-center font-mono text-xs sm:text-sm bg-forge-800 px-3 sm:px-4 py-2 rounded-full border border-forge-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 hidden sm:inline-block">STATUS:</span>
            {session ? (
              <span className="text-forge-accent drop-shadow-neon animate-pulse">ONLINE</span>
            ) : (
              <span className="text-forge-danger">OFFLINE</span>
            )}
          </div>

          {session && (
            <>
              <div className="w-px h-4 bg-gray-700"></div>
              {/* Dynamic XP Info from Profile hook */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-forge-xp font-bold drop-shadow-neon-xp">LVL {currentLevel}</span>
                <div className="hidden sm:flex flex-col gap-1 w-32">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{relativeXpInLevel}</span>
                    <span>1000</span>
                  </div>
                  {/* Mini XP progress bar */}
                  <div className="w-full h-1 bg-forge-900 rounded overflow-hidden">
                    <div
                      className="h-full bg-forge-xp shadow-neon-xp transition-all duration-1000"
                      style={{ width: `${(relativeXpInLevel / 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="w-px h-4 bg-gray-700"></div>
              <button
                onClick={signOut}
                title="Terminate Session"
                className="text-gray-500 hover:text-forge-danger transition-colors flex items-center gap-1 group"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Routing Area */}
      <main className="container mx-auto p-4 flex-grow flex flex-col">
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
                {/* Replaced old dashboard mockup with Real Kanban */}
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
