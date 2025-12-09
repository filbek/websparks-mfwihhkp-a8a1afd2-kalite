export interface SocialPost {
    id: string;
    content: string;
    image_url?: string;
    user_id: string;
    facility_id: number;
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;

    // Joined fields
    user?: {
        id: string;
        display_name: string;
        // avatar_url? if we had one
    };
    is_liked_by_user?: boolean; // For UI state
}

export interface SocialComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;

    // Joined fields
    user?: {
        id: string;
        display_name: string;
    };
}

export interface DiningMenu {
    id: string;
    date: string;
    facility_id: number;
    soup: string;
    main_dish: string;
    side_dish: string;
    dessert: string;
    created_at: string;
    updated_at: string;
}
