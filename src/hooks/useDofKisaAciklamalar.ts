import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DofKisaAciklama {
  id: string;
  kategori_value: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

export const useDofKisaAciklamalar = (kategoriValue: string | null) => {
  const [aciklamalar, setAciklamalar] = useState<DofKisaAciklama[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAciklamalar = async (kategori: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dof_kisa_aciklamalar')
        .select('*')
        .eq('kategori_value', kategori)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .range(0, 999);

      if (fetchError) throw fetchError;

      setAciklamalar(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Açıklamalar yüklenemedi');
      console.error('Error fetching dof kisa aciklamalar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kategoriValue) {
      fetchAciklamalar(kategoriValue);
    } else {
      setAciklamalar([]);
    }
  }, [kategoriValue]);

  return {
    aciklamalar,
    loading,
    error,
    refetch: kategoriValue ? () => fetchAciklamalar(kategoriValue) : () => {}
  };
};
