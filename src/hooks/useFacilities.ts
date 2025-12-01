import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Facility } from '../types';

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('facilities')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;

      setFacilities(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Şubeler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Fetch facilities error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return {
    facilities,
    loading,
    error,
    refetch: fetchFacilities,
  };
};
