import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Facility } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useFacilities = () => {
  const { currentOrganization, user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('facilities')
        .select('*')
        .order('id', { ascending: true });

      // System admin sees all facilities, others see only their organization's
      const isSystemAdmin = user?.role?.includes('system_admin');
      if (!isSystemAdmin && currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error: fetchError } = await query;

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
    if (currentOrganization || user?.role?.includes('system_admin')) {
      fetchFacilities();
    }
  }, [currentOrganization, user]);

  return {
    facilities,
    loading,
    error,
    refetch: fetchFacilities,
  };
};
