import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const WorkspaceContext = createContext()

export const WorkspaceProvider = ({ children }) => {
    const { user } = useAuth()
    const [workspaces, setWorkspaces] = useState([])
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null)

    const fetchWorkspaces = useCallback(async () => {
        if (!user) return
        setLoadingWorkspaces(true)

        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching workspaces:', error)
        } else {
            setWorkspaces(data || [])
        }
        setLoadingWorkspaces(false)
    }, [user])

    useEffect(() => {
        fetchWorkspaces()
    }, [fetchWorkspaces])

    const createWorkspace = async (name, type = 'personal') => {
        if (!user || !name.trim()) return { error: new Error("Name is required") }

        let inviteCode = null;
        if (type === 'group') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            inviteCode = Array.from({ length: 6 }).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        }

        const { data, error } = await supabase
            .from('workspaces')
            .insert([{ user_id: user.id, name, type, invite_code: inviteCode }])
            .select()

        if (error) {
            console.error("Error creating workspace:", error);
            alert(`Error creating workspace: ${error.message}`);
            return { error }
        }

        const newWorkspace = data[0]

        // Auto-join group workspaces as owner so relationships exist
        if (type === 'group') {
            const { error: memberError } = await supabase
                .from('workspace_members')
                .insert([{ workspace_id: newWorkspace.id, user_id: user.id, role: 'owner' }])

            if (memberError) {
                console.error("Error adding to members:", memberError)
            }
        }

        setWorkspaces(prev => [...prev, newWorkspace])
        return { data: newWorkspace }
    }

    const joinWorkspace = async (inviteCode) => {
        if (!user || !inviteCode.trim()) return { error: new Error("Code is required") }

        const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('*')
            .eq('invite_code', inviteCode.toUpperCase())
            .single()

        if (wsError || !wsData) {
            return { error: new Error("Invalid or expired invite code") }
        }

        const { error: joinError } = await supabase
            .from('workspace_members')
            .insert([{ workspace_id: wsData.id, user_id: user.id, role: 'member' }])

        if (joinError) {
            if (joinError.code === '23505') {
                return { error: new Error("You are already a member of this workspace") }
            }
            return { error: joinError }
        }

        setWorkspaces(prev => {
            if (prev.find(w => w.id === wsData.id)) return prev;
            return [...prev, wsData];
        })

        return { success: true, workspace: wsData }
    }

    const deleteWorkspace = async (id) => {
        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', id)

        if (!error) {
            setWorkspaces(prev => prev.filter(w => w.id !== id))
            if (activeWorkspaceId === id) setActiveWorkspaceId(null)
            return { success: true }
        }
        return { error }
    }

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            loadingWorkspaces,
            activeWorkspaceId,
            setActiveWorkspaceId,
            createWorkspace,
            joinWorkspace,
            deleteWorkspace,
            refreshWorkspaces: fetchWorkspaces
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const useWorkspaceContext = () => useContext(WorkspaceContext)
