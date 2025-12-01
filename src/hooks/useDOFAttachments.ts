import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DOFAttachment {
  id: string;
  dof_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  user?: {
    id: string;
    display_name: string;
  };
}

export const useDOFAttachments = (dofId: string | null) => {
  const [attachments, setAttachments] = useState<DOFAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    if (!dofId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dof_attachments')
        .select(`
          *,
          user:users!fk_uploaded_by(id, display_name)
        `)
        .eq('dof_id', dofId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAttachments(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosyalar yüklenemedi');
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [dofId]);

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments
  };
};
