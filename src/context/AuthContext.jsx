import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Escuchar la sesión actual al montar
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                console.error("Error fetching session:", error)
            }
            setSession(session)
            setUser(session?.user || null)
            setLoading(false)
        }

        getSession()

        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user || null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Funciones encapsuladas
    const signUp = async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username } // Se usará en el SQL trigger para crear el Profile
            }
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const value = {
        session,
        user,
        signUp,
        signIn,
        signOut,
    }

    // Prevenir parpadeo inicial usando un loader estilizado (estilo Cyberpunk)
    if (loading) {
        return (
            <div className="min-h-screen bg-forge-900 flex items-center justify-center font-mono text-forge-accent text-xl animate-pulse drop-shadow-neon">
                <span className="mr-2">&gt;</span> SYSTEM_BOOTING...
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
