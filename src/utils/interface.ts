export interface UserAuth {
    user_id: string;
    auth_type: string;
    password_hash: string;
    google_id: string;
    mfa_enabled: boolean;
    mfa_method: string;
    mfa_secret: string;
    mfa_email: string;
    created_at: string;
    updated_at: string;
}

export interface userprofile {
    user_id: string;
    nickname: string;
    age: number;
    gender: string;
    country_id: string;
    postal_code: string;
    address: string;
    profile_image: string;
    created_at: string;
    updated_at: string;
    mail_adress: string;
}

export interface Genre {
    genre_id: string;
    name: string;
    description: string;
    image_url: string;
    parent_genre_id: string;
    created_at: string;
    updated_at: string;
}

export interface Country {
    country_id: string;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
}

export interface WishBase {
    base_wish_id: string;
    title: string;
    detail: string;
    duration: string;
    cost: number;
    created_at: string;
    updated_at: string;
    basewish_image_url: string;
}

export interface WishCustom {
    user_id: string;
    title: string;
    detail: string;
    duration: number;
    cost: string;
    created_at: string;
    updated_at: string;
    custom_wish_id: string;
    base_wish_id: string;
    customwish_image_url: string;
}


//中間テーブル
export interface User_Genre {
    user_id: string;
    created_at: string;
    genre_id: string;
}

export interface User_CustomWish {
    user_id: string;
    created_at: string;
    custom_wish_id: string;
}

export interface Genre_BaseWish {
  genre_wish_id: string;
  genre_id: string;
  basewish_id: string;
  added_at: string;
}
