import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useMusic = () => {
    const { session } = useAuth()
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTracks = async () => {
        if (!session?.user?.id) return

        setLoading(true)
        const { data, error } = await supabase
            .from('user_tracks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tracks:', error)
        } else {
            // Pre-process to add actual public URLs
            const processedTracks = data.map(track => {
                const { data: publicUrlData } = supabase
                    .storage
                    .from('music')
                    .getPublicUrl(track.file_url)

                return {
                    ...track,
                    streamUrl: publicUrlData.publicUrl
                }
            })
            setTracks(processedTracks || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTracks()
    }, [session])

    const uploadTrack = async (file) => {
        if (!session?.user?.id || !file) return null

        const fileExt = file.name.split('.').pop()
        const fileName = `${session.user.id}/${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('music')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Insert into user_tracks table
            const { data, error: insertError } = await supabase
                .from('user_tracks')
                .insert([
                    {
                        user_id: session.user.id,
                        title: file.name.replace(`.${fileExt}`, ''), // Default title to filename
                        file_url: filePath
                    }
                ])
                .select()
                .single()

            if (insertError) throw insertError

            await fetchTracks() // Refresh the list
            return data

        } catch (error) {
            console.error('Error uploading track:', error)
            return null
        }
    }

    const deleteTrack = async (id, filePath) => {
        try {
            // 1. Delete from Database first (Cascades are safer if there are dependencies, but we are independent)
            const { error: dbError } = await supabase
                .from('user_tracks')
                .delete()
                .eq('id', id)

            if (dbError) throw dbError

            // 2. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('music')
                .remove([filePath])

            if (storageError) throw storageError

            setTracks(prev => prev.filter(t => t.id !== id))
            return true
        } catch (error) {
            console.error('Error deleting track:', error)
            return false
        }
    }

    return { tracks, loading, uploadTrack, deleteTrack, fetchTracks }
}
