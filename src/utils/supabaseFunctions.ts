import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export function useSupabase() {
  return supabase
}
