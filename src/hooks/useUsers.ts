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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum bulunamadı');

      // Get current user's role and organization
      const { data: currentUserData } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', user.id)
        .single();

      if (!currentUserData) throw new Error('Kullanıcı bilgileri alınamadı');

      const isSystemAdmin = currentUserData.role.includes('system_admin');

      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isSystemAdmin) {
        // If not system_admin, only show users from same organization OR users who are system_admin
        // We use an OR filter: (organization_id = my_org_id) OR (role contains system_admin)
        // PostgreSQL array contains operator is @> but PostgREST uses cs (contains)
        // Syntax for OR is .or(condition1,condition2)
        const orgFilter = `organization_id.eq.${currentUserData.organization_id}`;
        const sysAdminFilter = `role.cs.{system_admin}`;
        query = query.or(`${orgFilter},${sysAdminFilter}`);
      }

      const { data, error: fetchError } = await query;

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
      // Get current admin session and organization_id BEFORE signUp
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      if (!adminSession) throw new Error('Oturum bulunamadı');

      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', adminSession.user.id)
        .single();

      if (currentUserError) throw currentUserError;
      if (!currentUserData?.organization_id) throw new Error('Organizasyon bilgisi bulunamadı');

      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      // IMPORTANT: Restore admin session if signUp changed it
      // This ensures the INSERT happens with admin permissions
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user.id !== adminSession.user.id) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      // Now insert the user profile with admin session active
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
          organization_id: currentUserData.organization_id,
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
