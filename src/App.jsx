import { Routes, Route } from 'react-router-dom'
import { Terminal } from 'lucide-react'

// Placeholder components
const Dashboard = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6 mt-20">
    <Terminal className="w-16 h-16 text-forge-accent drop-shadow-neon" />
    <h1 className="text-4xl font-mono text-forge-accent drop-shadow-neon">
      THE FORGE: TASK ODYSSEY
    </h1>
    <p className="text-gray-400 max-w-md text-center leading-relaxed">
      Welcome, Architect. Your next level awaits. Connect to the network to synchronize your objectives.
    </p>
    <button className="px-6 py-3 mt-8 font-mono font-bold text-forge-900 bg-forge-accent rounded hover:bg-white hover:text-forge-900 transition-all duration-300 shadow-neon hover:shadow-[0_0_30px_rgba(0,255,204,0.8)]">
      INITIALIZE SYSTEM
    </button>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-forge-900 text-white font-sans selection:bg-forge-accent selection:text-forge-900">
      <nav className="p-4 border-b border-forge-800 flex justify-between items-center bg-forge-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-forge-accent transition-transform hover:scale-105 duration-300 cursor-pointer">
          <Terminal size={28} className="drop-shadow-neon" />
          <span className="font-mono font-bold tracking-widest text-lg drop-shadow-neon">THE FORGE</span>
        </div>
        <div className="flex gap-6 items-center font-mono text-sm bg-forge-800 px-4 py-2 rounded-full border border-forge-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">STATUS:</span>
            <span className="text-forge-accent drop-shadow-neon animate-pulse">ONLINE</span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-forge-xp font-bold drop-shadow-neon-xp">LVL 1</span>
            <span className="text-gray-400">0 / 1000 XP</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 h-[calc(100vh-77px)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
