import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useNotes = () => {
    const { user } = useAuth()

    const [folders, setFolders] = useState([])
    const [notes, setNotes] = useState([])

    const [loadingFolders, setLoadingFolders] = useState(true)
    const [loadingNotes, setLoadingNotes] = useState(true)

    // --- FOLDERS ---
    const fetchFolders = useCallback(async () => {
        if (!user) return
        setLoadingFolders(true)

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching folders:', error)
        } else {
            setFolders(data || [])
        }
        setLoadingFolders(false)
    }, [user])

    const createFolder = async (name) => {
        if (!user || !name.trim()) return

        const { data, error } = await supabase
            .from('folders')
            .insert([{ user_id: user.id, name }])
            .select()

        if (!error && data) {
            setFolders(prev => [...prev, data[0]])
            return { data: data[0] }
        }
        console.error("Create Folder Error:", error)
        alert(`Database Error (Folder): ${error?.message || 'Unknown error'}`)
        return { error }
    }

    const updateFolder = async (folderId, newName) => {
        if (!user || !newName.trim()) return

        const { data, error } = await supabase
            .from('folders')
            .update({ name: newName })
            .eq('id', folderId)
            .select()

        if (!error && data) {
            setFolders(prev => prev.map(f => f.id === folderId ? data[0] : f))
            return { data: data[0] }
        }
        return { error }
    }

    const deleteFolder = async (folderId) => {
        const { error } = await supabase.from('folders').delete().eq('id', folderId)
        if (!error) {
            setFolders(prev => prev.filter(f => f.id !== folderId))
            // Cascade delete should handle notes automatically via Supabase DB.
            // But we clear them locally just in case.
            setNotes(prev => prev.filter(n => n.folder_id !== folderId))
        }
    }

    // --- NOTES ---
    const fetchNotes = useCallback(async () => {
        if (!user) return
        setLoadingNotes(true)

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notes:', error)
        } else {
            setNotes(data || [])
        }
        setLoadingNotes(false)
    }, [user])

    useEffect(() => {
        fetchFolders()
        fetchNotes()
    }, [fetchFolders, fetchNotes])

    // Creates an empty Text note in a specific folder. 
    const createEmptyNote = async (folderId) => {
        if (!user || !folderId) return

        const { data, error } = await supabase
            .from('notes')
            .insert([{
                user_id: user.id,
                folder_id: folderId,
                title: 'Untitled Note',
                content: ''
            }])
            .select()

        if (!error && data) {
            setNotes(prev => [data[0], ...prev])
            return { data: data[0] }
        }
        console.error("Create Note Error:", error)
        alert(`Database Error (Note): ${error?.message || 'Unknown error'}`)
        return { error }
    }

    // Edits the text/title of a note
    const updateNoteText = async (noteId, updates) => {
        const { data, error } = await supabase
            .from('notes')
            .update({
                title: updates.title,
                content: updates.content
            })
            .eq('id', noteId)
            .select()

        if (!error && data) {
            setNotes(prev => prev.map(n => n.id === noteId ? data[0] : n))
        }
        return { error }
    }

    // Legacy hybrid: Saves a Canvas Blob to Supabase Storage and attaches to an existing Note
    const attachSketchToNote = async (noteId, imageBlob) => {
        if (!user) return

        const fileExt = 'png'
        const fileName = `${user.id}-${Math.random()}.${fileExt}`

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('note_images')
            .upload(fileName, imageBlob)

        if (uploadError) {
            console.error('Failed to upload note image', uploadError)
            return { error: uploadError }
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('note_images')
            .getPublicUrl(fileName)

        // 3. Update DB Record
        const { data, error } = await supabase
            .from('notes')
            .update({ image_url: publicUrl })
            .eq('id', noteId)
            .select()

        if (!error && data) {
            setNotes(prev => prev.map(n => n.id === noteId ? data[0] : n))
            return { data: data[0] }
        }
        return { error }
    }

    const deleteNote = async (noteId) => {
        const { error } = await supabase.from('notes').delete().eq('id', noteId)
        if (!error) {
            setNotes(prev => prev.filter(n => n.id !== noteId))
        }
    }

    return {
        folders,
        notes,
        loadingFolders,
        loadingNotes,

        createFolder,
        updateFolder,
        deleteFolder,

        createEmptyNote,
        updateNoteText,
        attachSketchToNote,
        deleteNote
    }
}
