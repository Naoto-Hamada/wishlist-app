import { createClient } from '@supabase/supabase-js'
import { userprofile } from './interface';

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

// Settingsにuserprofileを表示するため、userprofileDBからデータを取得する関数

export async function getUserProfile(userId: string): Promise<userprofile | null> {
  try {
    const { data, error } = await supabase
      .from('userprofile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('ユーザープロファイル取得エラー:', error);
    return null;
  }
}
