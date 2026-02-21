import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useTasks = () => {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
        } else {
            setTasks(data || [])
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    // Real-time listener for multi-device sync
    useEffect(() => {
        if (!user) return

        const channel = supabase.channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
                // Trigger a complete re-fetch to simplify logic and ensure data consistency across devices
                console.log('Realtime sync triggered:', payload)
                fetchTasks()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, fetchTasks])

    // New Add Task with Image Upload and Description
    const addTask = async (title, description, difficulty, imageFile) => {
        if (!user) return

        let uploadedImageUrl = null

        // Attempt to upload image if provided
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('task_images')
                .upload(fileName, imageFile)

            if (uploadError) {
                console.error('Image upload failed:', uploadError)
                // We will continue without the image if upload fails but log it.
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('task_images')
                    .getPublicUrl(fileName)
                uploadedImageUrl = publicUrl
            }
        }

        const xpMap = {
            'easy': 10,
            'medium': 50,
            'hard': 100
        }

        const newTask = {
            user_id: user.id,
            title,
            description: description || null,
            difficulty,
            xp_reward: xpMap[difficulty] || 10,
            status: 'todo',
            image_url: uploadedImageUrl
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()

        if (error) {
            console.error('Error adding task:', error)
            return { error }
        } else {
            // Local addition for instant feedback
            setTasks(prev => [data[0], ...prev])
            return { data: data[0] }
        }
    }

    const editTask = async (taskId, updates) => {
        if (!user) return

        let uploadedImageUrl = updates.image_url

        // Handle new image upload for existing task
        if (updates.imageFile) {
            const fileExt = updates.imageFile.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('task_images')
                .upload(fileName, updates.imageFile)

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('task_images')
                    .getPublicUrl(fileName)
                uploadedImageUrl = publicUrl
            }
        }

        const payload = {
            title: updates.title,
            description: updates.description || null,
            difficulty: updates.difficulty,
        }

        // XP mapping in case difficulty changed
        const xpMap = { 'easy': 10, 'medium': 50, 'hard': 100 }
        if (updates.difficulty) {
            payload.xp_reward = xpMap[updates.difficulty] || 10
        }

        if (uploadedImageUrl !== undefined) {
            payload.image_url = uploadedImageUrl
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(payload)
            .eq('id', taskId)
            .select()

        if (error) {
            console.error('Error editing task:', error)
            return { error }
        } else {
            setTasks(prev => prev.map(t => t.id === taskId ? data[0] : t))
            return { data: data[0] }
        }
    }

    const updateTaskStatus = async (taskId, newStatus) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId)
            .select()

        if (error) {
            console.error('Error updating task:', error)
            return { error }
        } else {
            setTasks(prev => prev.map(t => t.id === taskId ? data[0] : t))
            return { data: data[0] }
        }
    }

    const deleteTask = async (taskId) => {
        // Also try to delete image from bucket if we want to be clean, but not strictly required for this demo
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) {
            console.error('Error deleting task:', error)
            return { error }
        } else {
            setTasks(prev => prev.filter(t => t.id !== taskId))
            return { success: true }
        }
    }

    return {
        tasks,
        loading,
        addTask,
        editTask,
        updateTaskStatus,
        deleteTask,
        refreshTasks: fetchTasks
    }
}
