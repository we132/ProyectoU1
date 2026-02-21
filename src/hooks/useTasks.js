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

    const addTask = async (title, difficulty) => {
        if (!user) return

        // XP rewards mapping depending on difficulty
        const xpMap = {
            'easy': 10,
            'medium': 50,
            'hard': 100
        }

        const newTask = {
            user_id: user.id,
            title,
            difficulty,
            xp_reward: xpMap[difficulty] || 10,
            status: 'todo' // Default status
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()

        if (error) {
            console.error('Error adding task:', error)
            return { error }
        } else {
            setTasks(prev => [data[0], ...prev])
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
        updateTaskStatus,
        deleteTask,
        refreshTasks: fetchTasks
    }
}
