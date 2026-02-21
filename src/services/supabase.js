import { createClient } from '@supabase/supabase-js'

// Usamos valores por defecto temporales para evitar que la aplicación 
// explote (pantalla negra) si aún no has configurado el archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
