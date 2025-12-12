import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document, DocumentFormData, DocumentFilters } from '../types/documents';
import { useAuth } from '../contexts/AuthContext';

export const useDocuments = (filters?: DocumentFilters) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(*),
          uploader:users(id, display_name),
          facility:facilities(id, name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Filtreleri uygula
      if (filters?.folder_id) {
        query = query.eq('folder_id', filters.folder_id);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.file_type) {
        query = query.eq('file_type', filters.file_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dokümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (formData: DocumentFormData): Promise<Document> => {
    try {
      let folderId = formData.folder_id;

      if (!folderId && formData.category_id) {
        const { data: existingFolder } = await supabase
          .from('document_folders')
          .select('id')
          .eq('category_id', formData.category_id)
          .eq('facility_id', user?.facility_id || 1)
          .is('parent_id', null)
          .eq('is_active', true)
          .maybeSingle();

        if (!existingFolder) {
          const { data: category } = await supabase
            .from('document_categories')
            .select('name')
            .eq('id', formData.category_id)
            .single();

          if (category && user) {
            const { data: newFolder } = await supabase
              .from('document_folders')
              .insert({
                name: category.name,
                category_id: formData.category_id,
                facility_id: user.facility_id,
                organization_id: user.organization_id, // Add organization_id
                created_by: user.id,
                is_active: true
              })
              .select('id')
              .single();

            if (newFolder) {
              folderId = newFolder.id;
            }
          }
        } else {
          folderId = existingFolder.id;
        }
      }

      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          folder_id: folderId || null,
          file_name: formData.file.name,
          file_type: formData.file.type,
          file_size: formData.file.size,
          file_path: filePath,
          facility_id: user?.facility_id || (user as any)?.user_metadata?.facility_id, // Fallback if needed, logic relies on user context
          organization_id: user?.organization_id, // Add organization_id
          uploaded_by: user?.id || null,
          is_downloadable: formData.is_downloadable ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDocuments();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman yüklenirken hata oluştu');
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Önce doküman bilgilerini al
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Storage'dan dosyayı sil
      if (document?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) throw storageError;
      }

      // Veritabanından kaydı sil
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Doküman listesini güncelle
      await fetchDocuments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman silinirken hata oluştu');
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman indirilirken hata oluştu');
    }
  };

  const getDocumentUrl = async (document: Document): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      return URL.createObjectURL(data);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman URL\'si alınırken hata oluştu');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    getDocumentUrl,
    refetch: fetchDocuments,
  };
};