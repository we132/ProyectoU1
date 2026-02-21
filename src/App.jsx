import { Routes, Route, Navigate } from 'react-router-dom'
import { Terminal, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthUI } from './components/AuthUI'

// Placeholder components
const Dashboard = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 mt-20">
      <Terminal className="w-16 h-16 text-forge-accent drop-shadow-neon" />
      <h1 className="text-4xl font-mono text-forge-accent drop-shadow-neon text-center">
        WELCOME BACK, <br />
        <span className="text-white">{user?.user_metadata?.username || user?.email}</span>
      </h1>
      <p className="text-gray-400 max-w-md text-center leading-relaxed">
        Synchronization complete. The Forge is ready for your commands.
      </p>

      {/* Sign Out Button */}
      <button
        onClick={() => signOut()}
        className="px-6 py-3 mt-8 font-mono font-bold text-forge-danger border border-forge-danger/30 rounded hover:bg-forge-danger/10 transition-all duration-300 shadow-[0_0_10px_rgba(255,0,60,0.1)] flex items-center gap-2"
      >
        <LogOut size={18} />
        TERMINATE_SESSION
      </button>
    </div>
  )
};

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
  const { session } = useAuth()

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
              <div className="flex items-center gap-2">
                <span className="text-forge-xp font-bold drop-shadow-neon-xp">LVL 1</span>
                <span className="text-gray-400 hidden sm:inline-block">0 / 1000 XP</span>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Routing Area */}
      <main className="container mx-auto p-4 flex-grow">
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
                <Dashboard />
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
