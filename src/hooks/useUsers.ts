import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  display_name: string;
  role: string[];
  facility_id: number;
  department_id?: number | null;
  department_name?: string;
}

export interface UpdateUserData {
  display_name?: string;
  role?: string[];
  facility_id?: number;
  department_id?: number | null;
  department_name?: string;
  is_active?: boolean;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcılar yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<User> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          display_name: userData.display_name,
          role: userData.role,
          facility_id: userData.facility_id,
          department_id: userData.department_id,
          department_name: userData.department_name,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchUsers();
      return data as User;
    } catch (err) {
      console.error('Create user detailed error:', err);
      let errorMessage = 'Kullanıcı oluşturulurken hata oluştu';

      if (err instanceof Error) {
        errorMessage = err.message;
        // Supabase auth hatalarını özelleştir
        if (errorMessage.includes('security purposes')) {
          errorMessage = 'Güvenlik nedeniyle işlem engellendi. Lütfen bir süre bekleyip tekrar deneyin.';
        } else if (errorMessage.includes('already registered')) {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı.';
        }
      }

      throw new Error(errorMessage);
    }
  };

  const updateUser = async (userId: string, updates: UpdateUserData): Promise<User> => {
    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchUsers();
      return data as User;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı güncellenirken hata oluştu';
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (deleteError) throw deleteError;

      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı silinirken hata oluştu';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};
