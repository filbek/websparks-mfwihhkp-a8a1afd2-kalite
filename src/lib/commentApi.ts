import { supabase } from './supabase';

export interface Comment {
    id: string;
    card_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        display_name: string;
    };
}

// Fetch all comments for a card
export const fetchComments = async (cardId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('card_comments')
        .select(`
      *,
      user:users!card_comments_user_id_fkey (
        id,
        display_name
      )
    `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
};

// Create a new comment
export const createComment = async (cardId: string, content: string): Promise<Comment> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('card_comments')
        .insert({
            card_id: cardId,
            user_id: user.id,
            content,
        })
        .select(`
      *,
      user:users!card_comments_user_id_fkey (
        id,
        display_name
      )
    `)
        .single();

    if (error) throw error;
    return data;
};

// Update a comment
export const updateComment = async (id: string, content: string): Promise<Comment> => {
    const { data, error } = await supabase
        .from('card_comments')
        .update({ content })
        .eq('id', id)
        .select(`
      *,
      user:users!card_comments_user_id_fkey (
        id,
        display_name
      )
    `)
        .single();

    if (error) throw error;
    return data;
};

// Delete a comment
export const deleteComment = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('card_comments')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
