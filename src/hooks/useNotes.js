import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useNotes = () => {
    const { user } = useAuth()
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchNotes = useCallback(async () => {
        if (!user) return
        setLoading(true)

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
        setLoading(false)
    }, [user])

    useEffect(() => { fetchNotes() }, [fetchNotes])

    // Saves a Canvas Blob to Supabase Storage and inserts the Note record
    const saveNote = async (imageBlob) => {
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

        // 3. Save to DB
        const { data, error } = await supabase
            .from('notes')
            .insert([{ user_id: user.id, image_url: publicUrl }])
            .select()

        if (error) {
            console.error('Failed to save note record', error)
            return { error }
        }

        // Optimistic UI Update
        setNotes(prev => [data[0], ...prev])
        return { data: data[0] }
    }

    const deleteNote = async (noteId) => {
        // Omitting storage deletion for simplicity in this demo, but ideally we'd delete the file too
        const { error } = await supabase.from('notes').delete().eq('id', noteId)
        if (!error) {
            setNotes(prev => prev.filter(n => n.id !== noteId))
        }
    }

    return { notes, loading, saveNote, deleteNote }
}
