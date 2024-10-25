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

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error) {
    return { session: null, error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// プロフィール更新用の関数を追加
export async function updateUserProfile(userId: string, updates: Partial<userprofile>) {
  try {
    console.log('Updating profile for user:', userId)
    console.log('Update payload:', updates)

    const { data, error } = await supabase
      .from('userprofile')
      .update(updates)
      .eq('id', userId)  // user_id から id に修正
      .select();

    console.log('Supabase response:', { data, error })

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return { data: null, error };
  }
}

export async function getBaseWishes() {
  try {
    const { data, error } = await supabase
      .from('WishBase')
      .select('*');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('ベースウィッシュ取得エラー:', error);
    return { data: null, error };
  }
}
