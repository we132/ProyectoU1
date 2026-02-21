import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
    const { data, error } = await supabase.from('tasks').select('*').limit(1)
    if (error) {
        console.error('Error fetching tasks:', error.message)
        return
    }

    if (data.length > 0) {
        console.log('Columns in tasks:', Object.keys(data[0]))
    } else {
        console.log('No tasks found, attempting minimal insert to see error...')

        // Need an auth session for RLS. We might not have one in node unless we sign in.
        // But we can check via throwing an intentional type error if the column doesn't exist
        const { error: insertErr } = await supabase.from('tasks').insert([{ title: 'test', image_url: null }])
        console.log('Insert error pattern:', insertErr ? insertErr.message : 'No error')
    }
}
test()
