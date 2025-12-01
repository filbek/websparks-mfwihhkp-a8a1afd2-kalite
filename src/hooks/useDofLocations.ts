import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DofLocation {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useDofLocations = (includeInactive = false) => {
  const [locations, setLocations] = useState<DofLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('dof_locations')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setLocations(data || []);
    } catch (err) {
      console.error('Error fetching DOF locations:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    const subscription = supabase
      .channel('dof_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dof_locations'
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [includeInactive]);

  const addLocation = async (location: Omit<DofLocation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('dof_locations')
        .insert([location])
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      console.error('Error adding location:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Kayıt eklenirken hata oluştu'
      };
    }
  };

  const updateLocation = async (id: string, updates: Partial<DofLocation>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('dof_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (err) {
      console.error('Error updating location:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Kayıt güncellenirken hata oluştu'
      };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dof_locations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      console.error('Error deleting location:', err);
      return {
        error: err instanceof Error ? err.message : 'Kayıt silinirken hata oluştu'
      };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateLocation(id, { is_active: isActive });
  };

  const reorderLocations = async (reorderedLocations: DofLocation[]) => {
    try {
      const updates = reorderedLocations.map((loc, index) => ({
        id: loc.id,
        display_order: index + 1
      }));

      const promises = updates.map(update =>
        supabase
          .from('dof_locations')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );

      await Promise.all(promises);

      return { error: null };
    } catch (err) {
      console.error('Error reordering locations:', err);
      return {
        error: err instanceof Error ? err.message : 'Sıralama güncellenirken hata oluştu'
      };
    }
  };

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleActive,
    reorderLocations
  };
};
