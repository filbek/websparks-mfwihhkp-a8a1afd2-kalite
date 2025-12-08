import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Bildirimleri getir
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            const { data, error: fetchError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userData.user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (fetchError) throw fetchError;

            setNotifications(data || []);

            // Okunmamış bildirimleri say
            const unread = (data || []).filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, []);

    // Bildirimi okundu olarak işaretle
    const markAsRead = async (notificationId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId);

            if (updateError) throw updateError;

            // Local state'i güncelle
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: true, read_at: new Date().toISOString() }
                        : n
                )
            );

            // Okunmamış sayısını güncelle
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            throw new Error(err instanceof Error ? err.message : 'Bildirim güncellenemedi');
        }
    };

    // Tüm bildirimleri okundu olarak işaretle
    const markAllAsRead = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            const { error: updateError } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('user_id', userData.user.id)
                .eq('is_read', false);

            if (updateError) throw updateError;

            // Local state'i güncelle
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );

            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            throw new Error(err instanceof Error ? err.message : 'Bildirimler güncellenemedi');
        }
    };

    // Okunmamış bildirim sayısını getir
    const getUnreadCount = useCallback(async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return 0;

            const { count, error: countError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userData.user.id)
                .eq('is_read', false);

            if (countError) throw countError;

            return count || 0;
        } catch (err) {
            console.error('Error getting unread count:', err);
            return 0;
        }
    }, []);

    // Component mount olduğunda bildirimleri getir
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        const setupSubscription = async () => {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (!userData.user) return;

                // Yeni bildirimler için real-time subscription
                channel = supabase
                    .channel('notifications-changes')
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${userData.user.id}`
                        },
                        (payload) => {
                            const newNotification = payload.new as Notification;
                            setNotifications(prev => [newNotification, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        }
                    )
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${userData.user.id}`
                        },
                        (payload) => {
                            const updatedNotification = payload.new as Notification;
                            setNotifications(prev =>
                                prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                            );

                            // Okunmamış sayısını yeniden hesapla
                            setNotifications(current => {
                                const unread = current.filter(n => !n.is_read).length;
                                setUnreadCount(unread);
                                return current;
                            });
                        }
                    )
                    .subscribe();
            } catch (error) {
                console.error('Error setting up real-time subscription:', error);
            }
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        getUnreadCount
    };
};
