import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const CONFIGURADO = supabaseUrl && supabaseAnonKey

if (!CONFIGURADO) {
  console.warn(
    '%c⚠️ SUPABASE NO CONFIGURADO\n' +
    'Crea el archivo .env.local en la raíz del proyecto con:\n\n' +
    'VITE_SUPABASE_URL=https://TU_ID.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=tu_clave_anon\n\n' +
    'La app funciona en modo demo sin guardar datos.',
    'background:#f59e0b;color:#000;padding:8px;border-radius:4px'
  )
}

// Si no hay credenciales, usamos valores ficticios para que no explote
// La app funciona visualmente en "modo demo" sin guardar nada
export const supabase = CONFIGURADO
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key-for-local-dev')

export const supabaseConfigurado = CONFIGURADO
