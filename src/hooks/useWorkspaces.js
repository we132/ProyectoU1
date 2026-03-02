import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useWorkspaces = () => {
    const { user } = useAuth()
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchWorkspaces = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching workspaces:', error)
        } else {
            setWorkspaces(data || [])
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchWorkspaces()
    }, [fetchWorkspaces])

    const createWorkspace = async (name) => {
        if (!user || !name.trim()) return { error: new Error("Name is required") }

        const { data, error } = await supabase
            .from('workspaces')
            .insert([{ user_id: user.id, name }])
            .select()

        if (!error && data) {
            setWorkspaces(prev => [...prev, data[0]])
            return { data: data[0] }
        }
        return { error }
    }

    const deleteWorkspace = async (id) => {
        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', id)

        if (!error) {
            setWorkspaces(prev => prev.filter(w => w.id !== id))
            return { success: true }
        }
        return { error }
    }

    return {
        workspaces,
        loadingWorkspaces: loading,
        createWorkspace,
        deleteWorkspace,
        refreshWorkspaces: fetchWorkspaces
    }
}
