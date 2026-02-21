import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useProfile = () => {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const addXP = async (amount) => {
        if (!profile) return

        const newXpTotal = profile.xp + amount
        // Logic: 1000 XP per level. Formula: Base level 1 + floor(XP / 1000)
        const newLevel = Math.floor(newXpTotal / 1000) + 1
        const hasLevelledUp = newLevel > profile.level

        // Update local optimistic state first for fast UI feedback
        const updatedProfile = { ...profile, xp: newXpTotal, level: newLevel }
        setProfile(updatedProfile)

        // Sync with Database
        const { data, error } = await supabase
            .from('profiles')
            .update({ xp: newXpTotal, level: newLevel })
            .eq('id', user.id)
            .select()

        if (error) {
            console.error('Error adding XP:', error)
            // Rollback on fail
            setProfile(profile)
            return { error }
        }

        return { data: data[0], levelledUp: hasLevelledUp, newLevel }
    }

    const updateAvatar = async (url) => {
        if (!profile) return

        setProfile({ ...profile, avatar_url: url })
        const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: url })
            .eq('id', user.id)

        return { error }
    }

    return {
        profile,
        loading,
        addXP,
        updateAvatar,
        refreshProfile: fetchProfile
    }
}
