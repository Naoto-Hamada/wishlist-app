import { createClient } from '@supabase/supabase-js'
import { userprofile } from './interface';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// デバッグログを追加
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey)

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

// Settingsにuserprofileを表示するため、userprofileDBからデータ得する関数

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('userprofile')
    .select('address, age, gender')
    .eq('id', userId) // 'id'を使用
    .single();

  if (error) {
    console.error('ユーザープロファイルの取得に失敗しました:', error);
    throw error;
  }

  return data;
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

export async function createCustomWish(customWishData: Partial<WishCustom>) {
  try {
    // デバッグログを追加
    console.log('Supabaseに送信するデータ:', customWishData);

    const { data, error } = await supabase
      .from('WishCustom')
      .insert({
        ...customWishData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    // レスポンスのログ
    console.log('Supabaseのレスポンス:', { data, error });

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
      .eq('user_id', userId)
      .not('base_wish_id', 'is', null); // nullでないbase_wish_idのみを取得
    
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

    // JavaScriptでフィルタリング（base_wish_idがnullの場合を考慮）
    const unratedWishes = allWishes.filter(wish => 
      wish.base_wish_id && !ratedWishIds.includes(wish.base_wish_id)
    );

    console.log('フィルタ後のウィッシュ:', unratedWishes.length);

    return { data: unratedWishes, error: null };
  } catch (error) {
    console.error('未評価ベースウィッシュ取得エラー:', error);
    return { data: null, error };
  }
}

export async function deleteCustomWish(userId: string, baseWishId: string) {
  return await supabase
    .from('WishCustom')
    .delete()
    .match({ 
      user_id: userId, 
      base_wish_id: baseWishId 
    });
}

export async function getWishesByStatus(userId: string, status: string) {
  try {
    console.log(`Fetching wishes with status "${status}" for user ${userId}`);
    
    const { data, error } = await supabase
      .from('WishCustom')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status);
      // base_wish_idがnullかどうかに関係なく、すべてのアイテムを取得します

    console.log('Supabase response:', { data, error });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('ウィッシュ取得エラー:', error);
    return { data: null, error };
  }
}

export async function updateWishStatus(userId: string, baseWishId: string | null, customWishId: string, status: string) {
  try {
    const query = supabase
      .from('WishCustom')
      .update({ status: status })
      .eq('user_id', userId)
      .eq('custom_wish_id', customWishId);
    
    // base_wish_idがある場合のみ、その条件も追加
    if (baseWishId) {
      query.eq('base_wish_id', baseWishId);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return { data: null, error };
  }
}

export async function updateCustomWish(customWishId: string, updates: Partial<WishCustom>) {
  try {
    const { data, error } = await supabase
      .from('WishCustom')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('custom_wish_id', customWishId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('カスタムウィッシュ更新エラー:', error);
    return { data: null, error };
  }
}
