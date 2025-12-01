import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DofSorumluBolum {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useDofSorumluBolumler = (includeInactive = false) => {
  const [bolumler, setBolumler] = useState<DofSorumluBolum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBolumler = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('dof_sorumlu_bolumler')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setBolumler(data || []);
    } catch (err) {
      console.error('Error fetching dof sorumlu bolumler:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBolumler();

    const subscription = supabase
      .channel('dof_sorumlu_bolumler_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dof_sorumlu_bolumler'
        },
        () => {
          fetchBolumler();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [includeInactive]);

  const addSorumluBolum = async (bolum: Omit<DofSorumluBolum, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('dof_sorumlu_bolumler')
        .insert([bolum])
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      console.error('Error adding sorumlu bolum:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Kayıt eklenirken hata oluştu'
      };
    }
  };

  const updateSorumluBolum = async (id: string, updates: Partial<DofSorumluBolum>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('dof_sorumlu_bolumler')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (err) {
      console.error('Error updating sorumlu bolum:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Kayıt güncellenirken hata oluştu'
      };
    }
  };

  const deleteSorumluBolum = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dof_sorumlu_bolumler')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      console.error('Error deleting sorumlu bolum:', err);
      return {
        error: err instanceof Error ? err.message : 'Kayıt silinirken hata oluştu'
      };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateSorumluBolum(id, { is_active: isActive });
  };

  const reorderSorumluBolumler = async (reorderedBolumler: DofSorumluBolum[]) => {
    try {
      const updates = reorderedBolumler.map((bolum, index) => ({
        id: bolum.id,
        display_order: index + 1
      }));

      const promises = updates.map(update =>
        supabase
          .from('dof_sorumlu_bolumler')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );

      await Promise.all(promises);

      return { error: null };
    } catch (err) {
      console.error('Error reordering sorumlu bolumler:', err);
      return {
        error: err instanceof Error ? err.message : 'Sıralama güncellenirken hata oluştu'
      };
    }
  };

  return {
    sorumluBolumler: bolumler,
    loading,
    error,
    refetch: fetchBolumler,
    addSorumluBolum,
    updateSorumluBolum,
    deleteSorumluBolum,
    toggleActive,
    reorderSorumluBolumler
  };
};
