import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DOFComment {
  id: string;
  dof_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name: string;
  };
}

export const useDOFComments = (dofId: string | null) => {
  const [comments, setComments] = useState<DOFComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!dofId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dof_comments')
        .select(`
          *,
          user:users(id, display_name)
        `)
        .eq('dof_id', dofId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setComments(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorumlar yüklenemedi');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [dofId]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments
  };
};
