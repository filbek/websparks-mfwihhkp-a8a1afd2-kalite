import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface EventAttachment {
  id: string;
  event_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export const useEventAttachments = () => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (eventId: string, files: File[]) => {
    if (files.length === 0) return [];

    setUploading(true);
    setError(null);
    const uploadedAttachments: EventAttachment[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${eventId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: attachmentData, error: dbError } = await supabase
          .from('event_attachments')
          .insert({
            event_id: eventId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        uploadedAttachments.push(attachmentData as EventAttachment);
      }

      return uploadedAttachments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dosya yükleme başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getEventAttachments = async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('event_attachments')
        .select('*')
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data as EventAttachment[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dosyalar yüklenemedi';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('event-attachments')
        .download(filePath);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dosya indirilemedi';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('event-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('event_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dosya silinemedi';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    uploadFiles,
    getEventAttachments,
    downloadFile,
    deleteAttachment,
    uploading,
    loading,
    error
  };
};
