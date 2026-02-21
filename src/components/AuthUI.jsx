import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { MonitorPlay, AlertCircle, Loader2 } from 'lucide-react'

export const AuthUI = () => {
    const { t } = useLanguage()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Forms state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')

        try {
            if (isLogin) {
                const { error } = await signIn(email, password)
                if (error) throw error
            } else {
                if (!username.trim()) throw new Error('Username is required.')
                const { error } = await signUp(email, password, username)
                if (error) throw error
            }
        } catch (err) {
            setErrorMsg(err.message || 'Authentication failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">

            {/* Container - Clean, Dark, elevated like a streaming platform modal */}
            <div className="w-full max-w-md bg-forge-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-forge-700">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 text-forge-accent">
                        <MonitorPlay size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {isLogin ? t('loginTitle') : t('registerTitle')}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
                    </p>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-900/20 border border-forge-danger/50 text-red-200 flex items-start gap-3 rounded-lg text-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-forge-danger" />
                        <span className="leading-tight">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('usernameLabel')}</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent transition-all"
                                placeholder="User123"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('emailLabel')}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent transition-all"
                            placeholder={t('emailPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('passwordLabel')}</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Action Button - Primary Brand Red */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-4 bg-forge-accent text-white font-medium rounded-full hover:bg-forge-accent-hover transition-colors flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} /> {t('processing')}
                            </span>
                        ) : isLogin ? (
                            t('loginBtn')
                        ) : (
                            t('registerBtn')
                        )}
                    </button>
                </form>

                {/* Toggle Mode Footer */}
                <div className="mt-8 text-center pt-6 border-t border-forge-700">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? t('noAccount') : t('hasAccount')}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setErrorMsg('')
                                setPassword('')
                            }}
                            className="ml-2 text-forge-accent hover:text-white font-medium transition-colors"
                        >
                            {isLogin ? t('switchRegister') : t('switchLogin')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
