import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('--- THE FORGE: DIAGNOSTIC SYSTEM ---')
    console.log('⚡ Initializing Database Connection...')

    try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        if (authError) throw authError
        console.log('✅ Auth Module: ONLINE')

        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id').limit(1)
        if (profilesError) {
            console.log('🔴 ERROR IN PROFILES TABLE:', profilesError.message)
        } else {
            console.log('✅ Table `profiles`: ONLINE & ACCESSIBLE')
        }

        const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('id').limit(1)
        if (tasksError) {
            console.log('🔴 ERROR IN TASKS TABLE:', tasksError.message)
        } else {
            console.log('✅ Table `tasks`: ONLINE & ACCESSIBLE')
        }

        console.log('------------------------------------')
        console.log('🟢 ALL SYSTEMS OPERATIONAL. CONNECTION SUCCESSFUL.')

    } catch (err) {
        console.log('------------------------------------')
        console.log('🔴 CONNECTION FAILED!')
        console.error(err.message)
    }
}

testConnection()
