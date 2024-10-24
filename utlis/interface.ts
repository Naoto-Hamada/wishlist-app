export interface User {
    id: string;
    created_at: string;
    updated_at: string;
}

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

export interface UserProfile {
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

export interface UserGenre {
    user_id: string;
    created_at: string;
    genre_id: string;
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
