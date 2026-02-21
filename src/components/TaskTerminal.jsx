import { useState } from 'react'
import { Terminal, SendHorizontal } from 'lucide-react'

export const TaskTerminal = ({ onAddTask }) => {
    const [title, setTitle] = useState('')
    const [difficulty, setDifficulty] = useState('medium')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        await onAddTask(title, difficulty)
        setTitle('')
        setDifficulty('medium')
        setLoading(false)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-forge-800/80 backdrop-blur-md border border-forge-800 rounded-lg p-3 sm:p-4 mb-6 shadow-neon flex flex-col sm:flex-row gap-3 items-center group focus-within:ring-1 focus-within:ring-forge-accent/50 transition-all"
        >
            <div className="flex items-center gap-2 self-start sm:self-center">
                <Terminal className="text-forge-accent w-5 h-5 sm:w-6 sm:h-6 drop-shadow-neon" />
                <span className="text-forge-accent font-mono font-bold hidden sm:inline-block select-none">
                    C:\&gt;
                </span>
            </div>

            <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter new objective..."
                className="flex-grow w-full bg-transparent border-none text-white font-mono text-sm sm:text-base focus:outline-none placeholder-gray-600 focus:ring-0"
                disabled={loading}
            />

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-forge-700 pt-3 sm:pt-0 sm:pl-4">
                <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    disabled={loading}
                    className="bg-forge-900 border border-forge-700 text-xs font-mono text-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-forge-accent cursor-pointer"
                >
                    <option value="easy">EASY [10XP]</option>
                    <option value="medium">MED [50XP]</option>
                    <option value="hard">HARD [100XP]</option>
                </select>

                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="bg-forge-accent text-forge-900 px-4 py-1.5 rounded font-mono font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-2 shadow-[0_0_10px_rgba(0,255,204,0.4)]"
                >
                    <SendHorizontal size={16} />
                    <span className="hidden sm:inline-block">{loading ? '...' : 'EXEC'}</span>
                </button>
            </div>
        </form>
    )
}
