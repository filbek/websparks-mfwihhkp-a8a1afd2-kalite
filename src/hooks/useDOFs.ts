import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DOF } from '../types';

export const useDOFs = () => {
  const [dofs, setDofs] = useState<DOF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDOFs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dofs')
        .select(`
          *,
          facility:facilities(*),
          reporter:users!dofs_reporter_id_fkey(*),
          assignee:users!dofs_assigned_to_fkey(*),
          dofu_acan_user:users!dofs_dofu_acan_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const dofsWithComments = await Promise.all(
        (data || []).map(async (dof: any) => {
          const { data: comments, count } = await supabase
            .from('dof_comments')
            .select(`
              id,
              comment,
              created_at,
              user:users(id, display_name)
            `, { count: 'exact' })
            .eq('dof_id', dof.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: dof.id,
            title: dof.title,
            description: dof.description,
            facility_id: dof.facility_id,
            reporter_id: dof.reporter_id,
            assigned_to: dof.assigned_to,
            status: dof.status,
            priority: dof.priority,
            due_date: dof.due_date,
            created_at: dof.created_at,
            updated_at: dof.updated_at,
            tespit_tarihi: dof.tespit_tarihi,
            dof_kaynagi: dof.dof_kaynagi,
            dof_kategorisi: dof.dof_kategorisi,
            kisa_aciklama: dof.kisa_aciklama,
            sorumlu_bolum: dof.sorumlu_bolum,
            dofu_acan: dof.dofu_acan,
            facility: dof.facility,
            reporter: dof.reporter,
            assignee: dof.assignee,
            comment_count: count || 0,
            last_comment: comments && comments.length > 0 ? comments[0] : null
          };
        })
      );

      setDofs(dofsWithComments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DÖF\'ler yüklenemedi');
      console.error('Error fetching DOFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDOF = async (dofData: Partial<DOF>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const insertData = {
        title: dofData.title || 'Yeni DÖF',
        description: dofData.description || '',
        facility_id: dofData.facility_id || 1,
        reporter_id: dofData.reporter_id || userData.user.id,
        assigned_to: dofData.assigned_to || null,
        status: dofData.status || 'taslak',
        priority: dofData.priority || 'orta',
        due_date: dofData.due_date || null,
        tespit_tarihi: dofData.tespit_tarihi || new Date().toISOString().split('T')[0],
        dof_turu: dofData.dof_turu || null,
        tespit_edilen_yer: dofData.tespit_edilen_yer || null,
        dof_kaynagi: dofData.dof_kaynagi || null,
        dof_kategorisi: dofData.dof_kategorisi || null,
        kisa_aciklama: dofData.kisa_aciklama || null,
        sorumlu_bolum: dofData.sorumlu_bolum || null,
        dofu_acan: dofData.dofu_acan || userData.user.id
      };

      const { data, error: insertError } = await supabase
        .from('dofs')
        .insert([insertData])
        .select(`
          *,
          facility:facilities(*),
          reporter:users!dofs_reporter_id_fkey(*),
          assignee:users!dofs_assigned_to_fkey(*)
        `)
        .single();

      if (insertError) throw insertError;

      const newDOF: DOF = {
        id: data.id,
        title: data.title,
        description: data.description,
        facility_id: data.facility_id,
        reporter_id: data.reporter_id,
        assigned_to: data.assigned_to,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tespit_tarihi: data.tespit_tarihi,
        dof_turu: data.dof_turu,
        tespit_edilen_yer: data.tespit_edilen_yer,
        dof_kaynagi: data.dof_kaynagi,
        dof_kategorisi: data.dof_kategorisi,
        kisa_aciklama: data.kisa_aciklama,
        sorumlu_bolum: data.sorumlu_bolum,
        dofu_acan: data.dofu_acan,
        facility: data.facility,
        reporter: data.reporter,
        assignee: data.assignee
      };

      await supabase.from('dof_history').insert([{
        dof_id: newDOF.id,
        user_id: userData.user.id,
        action: 'created',
        new_value: insertData,
        comment: 'DÖF oluşturuldu'
      }]);

      setDofs(prev => [newDOF, ...prev]);
      return newDOF;
    } catch (err) {
      console.error('Error creating DOF:', err);
      throw new Error(err instanceof Error ? err.message : 'DÖF oluşturulamadı');
    }
  };

  const updateDOF = async (id: string, updates: Partial<DOF>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const oldDOF = dofs.find(dof => dof.id === id);

      const { data, error: updateError } = await supabase
        .from('dofs')
        .update({
          title: updates.title,
          description: updates.description,
          facility_id: updates.facility_id,
          assigned_to: updates.assigned_to,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.due_date,
          tespit_tarihi: updates.tespit_tarihi,
          dof_kaynagi: updates.dof_kaynagi,
          dof_kategorisi: updates.dof_kategorisi,
          kisa_aciklama: updates.kisa_aciklama,
          sorumlu_bolum: updates.sorumlu_bolum,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          facility:facilities(*),
          reporter:users!dofs_reporter_id_fkey(*),
          assignee:users!dofs_assigned_to_fkey(*)
        `)
        .single();

      if (updateError) throw updateError;

      const updatedDOF: DOF = {
        id: data.id,
        title: data.title,
        description: data.description,
        facility_id: data.facility_id,
        reporter_id: data.reporter_id,
        assigned_to: data.assigned_to,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tespit_tarihi: data.tespit_tarihi,
        dof_kaynagi: data.dof_kaynagi,
        dof_kategorisi: data.dof_kategorisi,
        kisa_aciklama: data.kisa_aciklama,
        sorumlu_bolum: data.sorumlu_bolum,
        dofu_acan: data.dofu_acan,
        facility: data.facility,
        reporter: data.reporter,
        assignee: data.assignee
      };

      await supabase.from('dof_history').insert([{
        dof_id: id,
        user_id: userData.user.id,
        action: 'updated',
        old_value: oldDOF,
        new_value: updates,
        comment: 'DÖF güncellendi'
      }]);

      setDofs(prev => prev.map(dof => dof.id === id ? updatedDOF : dof));
      return updatedDOF;
    } catch (err) {
      console.error('Error updating DOF:', err);
      throw new Error(err instanceof Error ? err.message : 'DÖF güncellenemedi');
    }
  };

  const deleteDOF = async (id: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const oldDOF = dofs.find(dof => dof.id === id);

      const { error: deleteError } = await supabase
        .from('dofs')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await supabase.from('dof_history').insert([{
        dof_id: id,
        user_id: userData.user.id,
        action: 'deleted',
        old_value: oldDOF,
        comment: 'DÖF silindi'
      }]);

      setDofs(prev => prev.filter(dof => dof.id !== id));
    } catch (err) {
      console.error('Error deleting DOF:', err);
      throw new Error(err instanceof Error ? err.message : 'DÖF silinemedi');
    }
  };

  const assignDOF = async (dofId: string, userId: string, notes: string, ccUserIds?: string[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data, error: updateError } = await supabase
        .from('dofs')
        .update({
          assigned_to: userId,
          cc_users: ccUserIds || null,
          status: 'atanan',
          updated_at: new Date().toISOString()
        })
        .eq('id', dofId)
        .select(`
          *,
          facility:facilities(*),
          reporter:users!dofs_reporter_id_fkey(*),
          assignee:users!dofs_assigned_to_fkey(*)
        `)
        .single();

      if (updateError) throw updateError;

      await supabase.from('dof_history').insert([{
        dof_id: dofId,
        user_id: userData.user.id,
        action: 'assigned',
        new_value: { assigned_to: userId, cc_users: ccUserIds },
        comment: notes || 'DÖF atandı'
      }]);

      const updatedDOF: DOF = {
        id: data.id,
        title: data.title,
        description: data.description,
        facility_id: data.facility_id,
        reporter_id: data.reporter_id,
        assigned_to: data.assigned_to,
        cc_users: data.cc_users,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tespit_tarihi: data.tespit_tarihi,
        dof_kaynagi: data.dof_kaynagi,
        dof_kategorisi: data.dof_kategorisi,
        kisa_aciklama: data.kisa_aciklama,
        sorumlu_bolum: data.sorumlu_bolum,
        dofu_acan: data.dofu_acan,
        tespit_edilen_yer: data.tespit_edilen_yer,
        facility: data.facility,
        reporter: data.reporter,
        assignee: data.assignee
      };

      setDofs(prev => prev.map(dof => dof.id === dofId ? updatedDOF : dof));
      return updatedDOF;
    } catch (err) {
      console.error('Error assigning DOF:', err);
      throw new Error(err instanceof Error ? err.message : 'DÖF atanamadı');
    }
  };

  const addComment = async (dofId: string, comment: string, isInternal: boolean) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { error: insertError } = await supabase
        .from('dof_comments')
        .insert([{
          dof_id: dofId,
          user_id: userData.user.id,
          comment,
          is_internal: isInternal
        }]);

      if (insertError) throw insertError;

      await supabase.from('dof_history').insert([{
        dof_id: dofId,
        user_id: userData.user.id,
        action: 'comment_added',
        new_value: { comment, is_internal: isInternal },
        comment: 'Yorum eklendi'
      }]);
    } catch (err) {
      console.error('Error adding comment:', err);
      throw new Error(err instanceof Error ? err.message : 'Yorum eklenemedi');
    }
  };

  const addAttachment = async (dofId: string, file: File) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const fileExt = file.name.split('.').pop();
      const fileName = `${dofId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dof-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const { error: insertError } = await supabase
        .from('dof_attachments')
        .insert([{
          dof_id: dofId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: fileName,
          uploaded_by: userData.user.id
        }]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        await supabase.storage.from('dof-attachments').remove([fileName]);
        throw insertError;
      }

      await supabase.from('dof_history').insert([{
        dof_id: dofId,
        user_id: userData.user.id,
        action: 'attachment_added',
        new_value: { file_name: file.name },
        comment: 'Dosya eklendi'
      }]);
    } catch (err) {
      console.error('Error adding attachment:', err);
      throw new Error(err instanceof Error ? err.message : 'Dosya eklenemedi');
    }
  };

  const changeStatus = async (dofId: string, newStatus: string, notes: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const oldDOF = dofs.find(dof => dof.id === dofId);
      const oldStatus = oldDOF?.status;

      const { data, error: updateError } = await supabase
        .from('dofs')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dofId)
        .select(`
          *,
          facility:facilities(*),
          reporter:users!dofs_reporter_id_fkey(*),
          assignee:users!dofs_assigned_to_fkey(*)
        `)
        .single();

      if (updateError) throw updateError;

      await supabase.from('dof_history').insert([{
        dof_id: dofId,
        user_id: userData.user.id,
        action: 'status_changed',
        old_value: { status: oldStatus },
        new_value: { status: newStatus },
        comment: notes || `Durum ${oldStatus}'dan ${newStatus}'e değiştirildi`
      }]);

      const updatedDOF: DOF = {
        id: data.id,
        title: data.title,
        description: data.description,
        facility_id: data.facility_id,
        reporter_id: data.reporter_id,
        assigned_to: data.assigned_to,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tespit_tarihi: data.tespit_tarihi,
        dof_kaynagi: data.dof_kaynagi,
        dof_kategorisi: data.dof_kategorisi,
        kisa_aciklama: data.kisa_aciklama,
        sorumlu_bolum: data.sorumlu_bolum,
        dofu_acan: data.dofu_acan,
        facility: data.facility,
        reporter: data.reporter,
        assignee: data.assignee
      };

      setDofs(prev => prev.map(dof => dof.id === dofId ? updatedDOF : dof));
      return updatedDOF;
    } catch (err) {
      console.error('Error changing status:', err);
      throw new Error(err instanceof Error ? err.message : 'Durum değiştirilemedi');
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data: attachment, error: fetchError } = await supabase
        .from('dof_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;
      if (!attachment) throw new Error('Dosya bulunamadı');

      const { error: storageError } = await supabase.storage
        .from('dof-attachments')
        .remove([attachment.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      const { error: deleteError } = await supabase
        .from('dof_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;

      await supabase.from('dof_history').insert([{
        dof_id: attachment.dof_id,
        user_id: userData.user.id,
        action: 'attachment_deleted',
        old_value: { file_name: attachment.file_name },
        comment: 'Dosya silindi'
      }]);
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw new Error(err instanceof Error ? err.message : 'Dosya silinemedi');
    }
  };

  const getAttachmentUrl = async (storagePath: string, expiresIn: number = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from('dof-attachments')
        .createSignedUrl(storagePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting attachment URL:', err);
      throw new Error(err instanceof Error ? err.message : 'Dosya URL\'si alınamadı');
    }
  };

  useEffect(() => {
    fetchDOFs();
  }, []);

  return {
    dofs,
    loading,
    error,
    fetchDOFs,
    createDOF,
    updateDOF,
    deleteDOF,
    assignDOF,
    addComment,
    addAttachment,
    deleteAttachment,
    getAttachmentUrl,
    changeStatus
  };
};
