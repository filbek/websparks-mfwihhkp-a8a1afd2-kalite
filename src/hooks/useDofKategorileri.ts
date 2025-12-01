import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DofKategori {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

export const useDofKategorileri = () => {
  const [kategoriler, setKategoriler] = useState<DofKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKategoriler = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dof_kategorileri')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setKategoriler(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenemedi');
      console.error('Error fetching dof kategorileri:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategoriler();
  }, []);

  return {
    kategoriler,
    loading,
    error,
    refetch: fetchKategoriler
  };
};
