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

// 新しい関数を追加
export async function createBaseToCustomWish(wishData: any) {
  try {
    console.log('Creating base to custom wish with data:', wishData);
    
    const { data, error } = await supabase
      .from('WishCustom')
      .insert([
        {
          title: wishData.title,
          detail: wishData.detail,
          duration: wishData.duration,
          cost: wishData.cost,
          base_wish_id: wishData.base_wish_id,
          customwish_image_url: wishData.image_url, // image_urlをcustomwish_image_urlに変更
          user_id: wishData.user_id,
          status: wishData.status,
          original_flag: wishData.original_flag
        }
      ])
      .select();

    console.log('Supabase response:', { data, error });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createBaseToCustomWish error:', error);
    return { data: null, error };
  }
}

export async function getMonthlyAchievements(userId: string, months: number | null) {
  try {
    const { data, error } = await supabase
      .from('WishCustom')
      .select('achievement_date')
      .eq('user_id', userId)
      .eq('status', 'やったことある')
      .not('achievement_date', 'is', null)
      .order('achievement_date', { ascending: true });

    if (error) throw error;

    // データが存在しない場合
    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // 月別の集計を行う
    const monthlyData = new Map();
    const currentDate = new Date();
    
    if (months === null) {
      // 全期間の場合、最古のデータから現在までを対象とする
      const oldestDate = new Date(data[0].achievement_date);
      const monthDiff = (currentDate.getFullYear() - oldestDate.getFullYear()) * 12 
                       + (currentDate.getMonth() - oldestDate.getMonth());
      months = monthDiff + 1;
    }

    // 月表示のフォーマットを修正
    for (let i = 0; i < months; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${date.getFullYear()}/${date.getMonth() + 1}`; // フォーマットを簡略化
      monthlyData.set(key, 0);
    }

    // 実際のデータで集計時も同じフォーマットを使用
    data.forEach(item => {
      const date = new Date(item.achievement_date);
      const key = `${date.getFullYear()}/${date.getMonth() + 1}`;
      if (monthlyData.has(key)) {
        monthlyData.set(key, monthlyData.get(key) + 1);
      }
    });

    // Map を配列に変換
    const result = Array.from(monthlyData.entries()).map(([month, count]) => ({
      month,
      count
    }));

    return { data: result.reverse(), error: null };
  } catch (error) {
    console.error('月別達成データ取得エラー:', error);
    return { data: null, error };
  }
}
