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

export async function createCustomWish(baseWish: WishBase, userId: string, status: string) {
  try {
    const customWish = {
      base_wish_id: baseWish.base_wish_id,
      title: baseWish.title,
      detail: baseWish.detail,
      duration: baseWish.duration, // テキストとしてそのまま保存
      cost: baseWish.cost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customwish_image_url: baseWish.basewish_image_url,
      user_id: userId,
      status: status
    };

    console.log('Prepared custom wish object:', customWish);

    const { data, error } = await supabase
      .from('WishCustom')
      .insert(customWish)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('カスタムウィッシュ作成エラー:', error);
    return { data: null, error };
  }
}

export async function getUnratedBaseWishes(userId: string) {
  try {
    // まず、ユーザーの評価済みウィッシュのIDを取得
    const { data: ratedWishes, error: ratedError } = await supabase
      .from('WishCustom')
      .select('base_wish_id')
      .eq('user_id', userId);
    
    // デバッグログを追加
    console.log('評価済みウィッシュ:', ratedWishes);
    console.log('評価済みウィッシュエラー:', ratedError);

    if (ratedError) throw ratedError;
    
    // 評価済みのbase_wish_idの配列を作成
    const ratedWishIds = ratedWishes ? ratedWishes.map(wish => wish.base_wish_id) : [];
    
    // 全ベースウィッシュを取得
    const { data: allWishes, error: wishError } = await supabase
      .from('WishBase')
      .select('*');

    // デバッグログを追加
    console.log('全ベースウィッシュ:', allWishes);
    console.log('ベースウィッシュエラー:', wishError);

    if (wishError) throw wishError;

    // JavaScriptでフィルタリング
    const unratedWishes = allWishes.filter(
      wish => !ratedWishIds.includes(wish.base_wish_id)
    );

    console.log('フィルタ後のウィッシュ:', unratedWishes.length);

    return { data: unratedWishes, error: null };
  } catch (error) {
    console.error('未評価ベースウィッシュ取得エラー:', error);
    return { data: null, error };
  }
}
