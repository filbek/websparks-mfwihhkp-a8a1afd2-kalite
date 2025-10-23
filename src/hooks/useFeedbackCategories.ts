import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FeedbackCategory } from '../types/feedback';

export const useFeedbackCategories = () => {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('feedback_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<FeedbackCategory, 'id' | 'created_at' | 'updated_at'>): Promise<FeedbackCategory> => {
    try {
      const { data, error } = await supabase
        .from('feedback_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      // Kategori listesini güncelle
      await fetchCategories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Kategori oluşturulurken hata oluştu');
    }
  };

  const updateCategory = async (id: string, updates: Partial<FeedbackCategory>): Promise<FeedbackCategory> => {
    try {
      const { data, error } = await supabase
        .from('feedback_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Kategori listesini güncelle
      await fetchCategories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Kategori güncellenirken hata oluştu');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      // Kategori listesini güncelle
      await fetchCategories();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Kategori silinirken hata oluştu');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};