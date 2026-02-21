import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Terminal, ShieldAlert, Zap, UserPlus, LogIn } from 'lucide-react'

export const AuthUI = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Forms state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('') // Only used for SignUp

    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')

        try {
            if (isLogin) {
                // Handle Login execution
                const { error } = await signIn(email, password)
                if (error) throw error
            } else {
                // Handle SignUp execution
                if (!username.trim()) throw new Error('Username alias is required for new architects.')
                const { error } = await signUp(email, password, username)
                if (error) throw error
            }
        } catch (err) {
            setErrorMsg(err.message || 'Authentication sequence failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
            {/* Container with Cyberpunk/terminal panel aesthetic */}
            <div className="w-full max-w-md bg-forge-800/80 backdrop-blur-md p-8 border border-forge-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">

                {/* Decorative neon top bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forge-800 via-forge-accent to-forge-800 opacity-50 shadow-neon"></div>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-forge-900 rounded border border-forge-800 mb-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                        <Terminal className="text-forge-accent w-10 h-10 drop-shadow-neon" />
                    </div>
                    <h2 className="text-2xl font-mono text-white tracking-widest uppercase">
                        {isLogin ? 'System Login' : 'New Architect'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 font-mono text-center">
                        {isLogin
                            ? 'Enter credentials to synchronize objectives.'
                            : 'Register your signature to join The Forge.'}
                    </p>
                </div>

                {/* Error Terminal output */}
                {errorMsg && (
                    <div className="mb-6 p-3 bg-forge-danger/10 border border-forge-danger text-forge-danger flex items-start gap-2 rounded text-sm font-mono shadow-[0_0_10px_rgba(255,0,60,0.2)]">
                        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                        <span className="leading-tight">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Conditional Username field for Sign up */}
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Alias [Username]</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-forge-900 border border-forge-800 rounded px-4 py-2.5 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/50 transition-colors"
                                placeholder="neo_01"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Network Comm [Email]</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-forge-900 border border-forge-800 rounded px-4 py-2.5 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/50 transition-colors"
                            placeholder="architect@theforge.net"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Decryption Key [Password]</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-forge-900 border border-forge-800 rounded px-4 py-2.5 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/50 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-3 px-4 bg-forge-accent text-forge-900 font-bold font-mono tracking-wide rounded hover:bg-white transition-all flex justify-center items-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed shadow-neon"
                    >
                        {loading ? (
                            <span className="animate-pulse flex items-center gap-2">
                                <Terminal className="animate-spin" size={18} /> PROCESSING...
                            </span>
                        ) : isLogin ? (
                            <>
                                <LogIn size={18} className="transition-transform group-hover/btn:translate-x-1" />
                                INITIATE_SESSION
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} className="transition-transform group-hover/btn:scale-110" />
                                CREATE_IDENTITY
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Mode Footer */}
                <div className="mt-8 text-center border-t border-forge-800 pt-6">
                    <p className="text-gray-500 text-sm font-mono">
                        {isLogin ? 'No active signature?' : 'Identity already established?'}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setErrorMsg('')
                                setPassword('')
                            }}
                            className="ml-2 text-forge-accent hover:text-white underline decoration-forge-accent/30 hover:decoration-white underline-offset-4 transition-colors font-bold"
                        >
                            {isLogin ? 'Register Now' : 'Access System'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
