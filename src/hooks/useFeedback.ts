import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FeedbackSuggestion, FeedbackFormData, FeedbackFilters } from '../types/feedback';
import { User, Facility } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useFeedback = (filters?: FeedbackFilters) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, canAccessFacility } = useAuth();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('feedback_suggestions')
        .select(`
          *,
          category:feedback_categories(*),
          reporter:users(id, display_name),
          facility:facilities(id, name),
          responses:feedback_responses(*, responder:users(id, display_name))
        `)
        .order('created_at', { ascending: false });

      // Filtreleri uygula
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.facility_id) {
        query = query.eq('facility_id', filters.facility_id);
      }
      if (filters?.reporter_id) {
        query = query.eq('reporter_id', filters.reporter_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Vote count hesapla
      const feedbacksWithVoteCount = data?.map(feedback => ({
        ...feedback,
        vote_count: feedback.upvotes - feedback.downvotes
      })) || [];

      setFeedbacks(feedbacksWithVoteCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görüşler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createFeedback = async (formData: FeedbackFormData): Promise<FeedbackSuggestion> => {
    console.log('createFeedback BAŞLADI', formData);
    try {
      if (!user) {
        console.error('Kullanıcı yok!');
        throw new Error('Görüş oluşturmak için giriş yapmalısınız');
      }

      const insertData: any = {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        priority: formData.priority,
        is_anonymous: formData.is_anonymous,
        tags: formData.tags,
        facility_id: user.facility_id,
      };

      // Kullanıcının organizasyonunu al
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      insertData.organization_id = userData.organization_id;

      // Anonim değilse reporter_id ekle
      if (!formData.is_anonymous) {
        insertData.reporter_id = user.id;
      } else {
        // Anonim ise iletişim bilgilerini ekle
        insertData.reporter_name = formData.reporter_name;
        insertData.reporter_email = formData.reporter_email;
        insertData.reporter_phone = formData.reporter_phone;
      }

      const { data, error } = await supabase
        .from('feedback_suggestions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Feedback listesini güncelle
      await fetchFeedbacks();
      return data;
    } catch (err) {
      console.error('createFeedback CATCH BLOĞU:', err);
      throw new Error(err instanceof Error ? err.message : 'Görüş oluşturulurken hata oluştu');
    }
  };

  const updateFeedback = async (id: string, updates: Partial<FeedbackSuggestion>): Promise<FeedbackSuggestion> => {
    try {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Feedback listesini güncelle
      await fetchFeedbacks();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Görüş güncellenirken hata oluştu');
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Feedback listesini güncelle
      await fetchFeedbacks();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Görüş silinirken hata oluştu');
    }
  };

  const voteFeedback = async (id: string, voteType: 'up' | 'down') => {
    try {
      if (!user) {
        throw new Error('Oy vermek için giriş yapmalısınız');
      }

      const userId = user.id;

      // Önce kullanıcının daha önce oy verip vermediğini kontrol et
      const { data: existingVote } = await supabase
        .from('feedback_votes')
        .select('*')
        .eq('feedback_id', id)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Mevcut oyu güncelle
        if (existingVote.vote_type === voteType) {
          // Aynı oy ise kaldır
          await supabase
            .from('feedback_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Farklı oy ise güncelle
          await supabase
            .from('feedback_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Yeni oy ekle
        await supabase
          .from('feedback_votes')
          .insert({
            feedback_id: id,
            user_id: userId,
            vote_type: voteType
          });
      }

      // Upvotes/downvotes sayılarını güncelle
      const { data: votes } = await supabase
        .from('feedback_votes')
        .select('vote_type')
        .eq('feedback_id', id);

      const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;

      await supabase
        .from('feedback_suggestions')
        .update({ upvotes, downvotes })
        .eq('id', id);

      // Feedback listesini güncelle
      await fetchFeedbacks();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Oy verilirken hata oluştu');
    }
  };

  const addResponse = async (feedbackId: string, response: string, isInternal: boolean = false) => {
    try {
      if (!user) {
        throw new Error('Yanıt eklemek için giriş yapmalısınız');
      }

      const userId = user.id;

      const { error } = await supabase
        .from('feedback_responses')
        .insert({
          feedback_id: feedbackId,
          responder_id: userId,
          response,
          is_internal: isInternal
        });

      if (error) throw error;

      // Feedback durumunu güncelle
      await supabase
        .from('feedback_suggestions')
        .update({ status: 'inceleniyor' })
        .eq('id', feedbackId);

      // Feedback listesini güncelle
      await fetchFeedbacks();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Yanıt eklenirken hata oluştu');
    }
  };

  const incrementViewCount = async (id: string) => {
    try {
      await supabase.rpc('increment_feedback_view_count', { feedback_id: id });
    } catch (err) {
      // View count hatası kritik değil, sessizce geç
      console.error('View count increment error:', err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  return {
    feedbacks,
    loading,
    error,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    voteFeedback,
    addResponse,
    incrementViewCount,
    refetch: fetchFeedbacks,
  };
};