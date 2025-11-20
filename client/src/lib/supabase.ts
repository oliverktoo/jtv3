import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single Supabase client instance to prevent multiple GoTrueClient warnings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Provide a unique storage key to prevent conflicts
    storageKey: 'jamii-tourney-auth-token',
    // Set flow type to pkce for better security
    flowType: 'pkce'
  },
  // Add realtime configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})