import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DofKaynak {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

export const useDofKaynaklari = () => {
  const [kaynaklar, setKaynaklar] = useState<DofKaynak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKaynaklar = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dof_kaynaklari')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setKaynaklar(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaynaklar yüklenemedi');
      console.error('Error fetching dof kaynaklari:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaynaklar();
  }, []);

  return {
    kaynaklar,
    loading,
    error,
    refetch: fetchKaynaklar
  };
};
