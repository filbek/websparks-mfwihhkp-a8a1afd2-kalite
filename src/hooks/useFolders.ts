import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DocumentFolder, FolderFilters, FolderFormData } from '../types/documents';
import { useAuth } from '../contexts/AuthContext';

export const useFolders = (filters?: FolderFilters) => {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('document_folders')
        .select(`
          *,
          category:document_categories(*),
          facility:facilities(*)
        `)
        .eq('is_active', true);

      if (filters?.parent_id !== undefined) {
        if (filters.parent_id === null || filters.parent_id === '') {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parent_id);
        }
      } else {
        query = query.is('parent_id', null);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const foldersWithCounts = await Promise.all(
        (data || []).map(async (folder) => {
          const [{ count: docCount }, { count: subfolderCount }] = await Promise.all([
            supabase
              .from('documents')
              .select('id', { count: 'exact', head: true })
              .eq('folder_id', folder.id)
              .eq('is_active', true),
            supabase
              .from('document_folders')
              .select('id', { count: 'exact', head: true })
              .eq('parent_id', folder.id)
              .eq('is_active', true)
          ]);

          return {
            ...folder,
            document_count: docCount || 0,
            subfolder_count: subfolderCount || 0
          };
        })
      );

      setFolders(foldersWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klasörler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (formData: FolderFormData) => {
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('document_folders')
      .insert({
        name: formData.name,
        description: formData.description,
        parent_id: formData.parent_id || null,
        category_id: formData.category_id || null,
        facility_id: user.facility_id,
        created_by: user.id
      })
      .select(`
        *,
        category:document_categories(*),
        facility:facilities(*)
      `)
      .single();

    if (error) throw error;

    await fetchFolders();
    return data;
  };

  const updateFolder = async (folderId: string, formData: Partial<FolderFormData>) => {
    const { data, error } = await supabase
      .from('document_folders')
      .update({
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select(`
        *,
        category:document_categories(*),
        facility:facilities(*)
      `)
      .single();

    if (error) throw error;

    await fetchFolders();
    return data;
  };

  const deleteFolder = async (folderId: string) => {
    const { error } = await supabase
      .from('document_folders')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', folderId);

    if (error) throw error;

    await fetchFolders();
  };

  const moveFolder = async (folderId: string, newParentId: string | null) => {
    const { error } = await supabase
      .from('document_folders')
      .update({
        parent_id: newParentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId);

    if (error) throw error;

    await fetchFolders();
  };

  const getFolderPath = async (folderId: string): Promise<DocumentFolder[]> => {
    const path: DocumentFolder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('id', currentId)
        .single();

      if (error || !data) break;

      path.unshift(data);
      currentId = data.parent_id;
    }

    return path;
  };

  useEffect(() => {
    fetchFolders();
  }, [filters?.parent_id, filters?.category_id, filters?.search]);

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    getFolderPath,
    refetch: fetchFolders
  };
};
