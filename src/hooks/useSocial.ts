import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SocialPost, SocialComment, DiningMenu } from '../types/social';

export const useSocial = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Social Posts ---

    const fetchPosts = async (page = 0, limit = 10) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            // Get user's facility
            const { data: userData } = await supabase
                .from('users')
                .select('facility_id')
                .eq('id', user.id)
                .single();

            if (!userData) throw new Error('Kullanıcı bilgileri eksik');

            const { data, error: postError } = await supabase
                .from('social_posts')
                .select(`
          *,
          user:users(id, display_name),
          likes:social_likes(user_id)
        `)
                .eq('facility_id', userData.facility_id)
                .order('created_at', { ascending: false })
                .range(page * limit, (page + 1) * limit - 1);

            if (postError) throw postError;

            const postsWithLikeStatus = data?.map((post: any) => ({
                ...post,
                is_liked_by_user: post.likes.some((like: any) => like.user_id === user.id)
            }));

            return postsWithLikeStatus as SocialPost[];
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('social-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('social-uploads')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            throw new Error('Resim yüklenirken bir hata oluştu: ' + error.message);
        }
    };

    const createPost = async (content: string, imageFile?: File) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            // Get facility
            const { data: userData } = await supabase
                .from('users')
                .select('facility_id')
                .eq('id', user.id)
                .single();

            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const { error: insertError } = await supabase
                .from('social_posts')
                .insert({
                    content,
                    image_url: imageUrl,
                    user_id: user.id,
                    facility_id: userData?.facility_id
                });

            if (insertError) throw insertError;
            return true;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async (postId: string, content: string) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error: updateError } = await supabase
                .from('social_posts')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', postId)
                .eq('user_id', user.id);

            if (updateError) throw updateError;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: string) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error: deleteError } = await supabase
                .from('social_posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const likePost = async (postId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error } = await supabase
                .from('social_likes')
                .insert({ post_id: postId, user_id: user.id });

            if (error) throw error;
        } catch (err: any) {
            console.error('Error liking post:', err);
        }
    };

    const unlikePost = async (postId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error } = await supabase
                .from('social_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (err: any) {
            console.error('Error unliking post:', err);
        }
    };

    // --- Comments ---

    const fetchComments = async (postId: string) => {
        try {
            const { data, error } = await supabase
                .from('social_comments')
                .select(`
          *,
          user:users(id, display_name)
        `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as SocialComment[];
        } catch (err: any) {
            console.error('Error fetching comments:', err);
            return [];
        }
    };

    const createComment = async (postId: string, content: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error } = await supabase
                .from('social_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content
                });

            if (error) throw error;
        } catch (err: any) {
            console.error('Error creating comment:', err);
            throw err;
        }
    };

    // --- Dining Menu ---

    const fetchMenu = async (date: Date) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data: userData } = await supabase
                .from('users')
                .select('facility_id')
                .eq('id', user.id)
                .single();

            if (!userData) return null;

            const dateStr = date.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('dining_menus')
                .select('*')
                .eq('facility_id', userData.facility_id)
                .eq('date', dateStr)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data as DiningMenu | null;
        } catch (err: any) {
            console.error('Error fetching menu:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateMenu = async (menuData: Partial<DiningMenu> & { date: string }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { data: userData } = await supabase
                .from('users')
                .select('facility_id')
                .eq('id', user.id)
                .single();

            if (!userData) throw new Error('Kullanıcı bilgileri eksik');

            const { error } = await supabase
                .from('dining_menus')
                .upsert({
                    ...menuData,
                    facility_id: userData.facility_id,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'date, facility_id' });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        loading,
        error,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
        likePost,
        unlikePost,
        fetchComments,
        createComment,
        fetchMenu,
        updateMenu
    };
};
