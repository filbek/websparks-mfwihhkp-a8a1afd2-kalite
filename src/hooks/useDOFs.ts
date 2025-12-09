import { useState, useEffect } from 'react';
import { DOF } from '../types';
import { supabase } from '../lib/supabase';

export interface DOFComment {
    id: string;
    dof_id: string;
    user_id: string;
    comment: string;
    is_internal: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        display_name: string;
    };
}

export interface DOFAttachment {
    id: string;
    dof_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    uploaded_by: string;
    created_at: string;
}

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
          facility:facilities(id, name),
          reporter:users!dofs_reporter_id_fkey(id, display_name, role, facility_id),
          assignee:users!dofs_assigned_to_fkey(id, display_name, role, facility_id)
        `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const dofsWithComments = await Promise.all((data || []).map(async (dof) => {
                const { data: comments } = await supabase
                    .from('dof_comments')
                    .select(`
            id,
            comment,
            created_at,
            user:users(id, display_name)
          `)
                    .eq('dof_id', dof.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const { count } = await supabase
                    .from('dof_comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('dof_id', dof.id);

                return {
                    ...dof,
                    comment_count: count || 0,
                    last_comment: comments && comments.length > 0 ? comments[0] : null
                };
            }));

            setDofs(dofsWithComments);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata olustu';
            setError(errorMessage);
            console.error('Error fetching DOFs:', err);
        } finally {
            setLoading(false);
        }
    };

    const createDOF = async (dofData: Partial<DOF>) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error('Kullanici oturumu bulunamadi');
            }

            const newDOF: Record<string, unknown> = {
                title: dofData.title || '',
                description: dofData.description || '',
                facility_id: dofData.facility_id || 1,
                reporter_id: userData.user.id,
                dofu_acan: dofData.dofu_acan || userData.user.id,
                // Eğer atanan kişi varsa durum 'çözüm_bekleyen', yoksa 'atanmayı_bekleyen' veya gelen status. Taslak varsayılan
                status: dofData.assigned_to ? 'çözüm_bekleyen' : (dofData.status || 'atanmayı_bekleyen'),
                priority: dofData.priority || 'orta',
                dof_turu: dofData.dof_turu,
                tespit_tarihi: dofData.tespit_tarihi,
                tespit_edilen_bolum: dofData.tespit_edilen_bolum,
                tespit_edilen_yer: dofData.tespit_edilen_yer,
                dof_kaynagi: dofData.dof_kaynagi,
                dof_kategorisi: dofData.dof_kategorisi,
                kisa_aciklama: dofData.kisa_aciklama,
                sorumlu_bolum: dofData.sorumlu_bolum,
                tanim: dofData.tanim,
                due_date: dofData.due_date,
                assigned_to: dofData.assigned_to // Atanan kişi eklendi
            };

            const { data, error: insertError } = await supabase
                .from('dofs')
                .insert(newDOF)
                .select(`
          *,
          facility:facilities(id, name),
          reporter:users!dofs_reporter_id_fkey(id, display_name, role, facility_id)
        `)
                .single();

            if (insertError) throw insertError;

            // Eğer atama yapıldıysa bildirim oluştur
            if (dofData.assigned_to) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: dofData.assigned_to,
                        type: 'dof_assignment',
                        related_type: 'dof',
                        related_id: data.id
                    });
            }

            await fetchDOFs();

            return data as DOF;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'DOF olusturulamadi';
            console.error('Error creating DOF:', err);
            throw new Error(errorMessage);
        }
    };

    const updateDOF = async (id: string, updates: Partial<DOF>) => {
        try {
            const { data, error: updateError } = await supabase
                .from('dofs')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select(`
          *,
          facility:facilities(id, name),
          reporter:users!dofs_reporter_id_fkey(id, display_name, role, facility_id),
          assignee:users!dofs_assigned_to_fkey(id, display_name, role, facility_id)
        `)
                .single();

            if (updateError) throw updateError;

            await fetchDOFs();

            return data as DOF;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'DOF guncellenemedi';
            console.error('Error updating DOF:', err);
            throw new Error(errorMessage);
        }
    };

    const deleteDOF = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('dofs')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setDofs(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'DOF silinemedi';
            console.error('Error deleting DOF:', err);
            throw new Error(errorMessage);
        }
    };

    const assignDOF = async (dofId: string, userId: string, notes?: string, ccUserIds?: string[]) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error('Kullanici oturumu bulunamadi');
            }

            const { data, error: updateError } = await supabase
                .from('dofs')
                .update({
                    assigned_to: userId,
                    cc_users: ccUserIds || [],
                    status: 'çözüm_bekleyen',
                    updated_at: new Date().toISOString()
                })
                .eq('id', dofId)
                .select(`
          *,
          facility:facilities(id, name),
          reporter:users!dofs_reporter_id_fkey(id, display_name, role, facility_id),
          assignee:users!dofs_assigned_to_fkey(id, display_name, role, facility_id)
        `)
                .single();

            if (updateError) throw updateError;

            if (notes && notes.trim()) {
                await supabase
                    .from('dof_comments')
                    .insert({
                        dof_id: dofId,
                        user_id: userData.user.id,
                        comment: 'Atama Notu: ' + notes,
                        is_internal: false
                    });
            }

            await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'dof_assignment',
                    related_type: 'dof',
                    related_id: dofId
                });

            if (ccUserIds && ccUserIds.length > 0) {
                const ccNotifications = ccUserIds.map(ccUserId => ({
                    user_id: ccUserId,
                    type: 'dof_cc',
                    related_type: 'dof',
                    related_id: dofId
                }));

                await supabase
                    .from('notifications')
                    .insert(ccNotifications);
            }

            await fetchDOFs();

            return data as DOF;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'DOF atanamadi';
            console.error('Error assigning DOF:', err);
            throw new Error(errorMessage);
        }
    };

    const changeStatus = async (dofId: string, newStatus: string, notes?: string) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error('Kullanici oturumu bulunamadi');
            }

            const { data, error: updateError } = await supabase
                .from('dofs')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', dofId)
                .select(`
          *,
          facility:facilities(id, name),
          reporter:users!dofs_reporter_id_fkey(id, display_name, role, facility_id),
          assignee:users!dofs_assigned_to_fkey(id, display_name, role, facility_id)
        `)
                .single();

            if (updateError) throw updateError;

            if (notes && notes.trim()) {
                await supabase
                    .from('dof_comments')
                    .insert({
                        dof_id: dofId,
                        user_id: userData.user.id,
                        comment: 'Durum Degisikligi (' + newStatus + '): ' + notes,
                        is_internal: false
                    });
            }

            await fetchDOFs();

            return data as DOF;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Durum degistirilemedi';
            console.error('Error changing status:', err);
            throw new Error(errorMessage);
        }
    };

    const addComment = async (dofId: string, comment: string, isInternal: boolean = false) => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error('Kullanici oturumu bulunamadi');
            }

            const { error: insertError } = await supabase
                .from('dof_comments')
                .insert({
                    dof_id: dofId,
                    user_id: userData.user.id,
                    comment: comment,
                    is_internal: isInternal
                });

            if (insertError) throw insertError;

            const currentDOF = dofs.find(d => d.id === dofId);

            if (currentDOF && currentDOF.assigned_to === userData.user.id) {
                await supabase
                    .from('dofs')
                    .update({
                        status: 'kapatma_onayinda',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', dofId);

                if (currentDOF.dofu_acan || currentDOF.reporter_id) {
                    const notifyUserId = currentDOF.dofu_acan || currentDOF.reporter_id;
                    await supabase
                        .from('notifications')
                        .insert({
                            user_id: notifyUserId,
                            type: 'dof_approval_required',
                            related_type: 'dof',
                            related_id: dofId
                        });
                }
            }

            await fetchDOFs();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Yorum eklenemedi';
            console.error('Error adding comment:', err);
            throw new Error(errorMessage);
        }
    };

    const addAttachment = async (dofId: string, file: File): Promise<DOFAttachment> => {
        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error('Kullanici oturumu bulunamadi');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = dofId + '/' + Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;

            const { error: uploadError } = await supabase.storage
                .from('dof-attachments')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('dof-attachments')
                .getPublicUrl(fileName);

            const { data, error: insertError } = await supabase
                .from('dof_attachments')
                .insert({
                    dof_id: dofId,
                    file_name: file.name,
                    file_path: urlData.publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                    uploaded_by: userData.user.id
                })
                .select()
                .single();

            if (insertError) throw insertError;

            return data as DOFAttachment;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Dosya yuklenemedi';
            console.error('Error adding attachment:', err);
            throw new Error(errorMessage);
        }
    };

    const getComments = async (dofId: string): Promise<DOFComment[]> => {
        try {
            const { data, error } = await supabase
                .from('dof_comments')
                .select(`
          *,
          user:users(id, display_name)
        `)
                .eq('dof_id', dofId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (err) {
            console.error('Error fetching comments:', err);
            return [];
        }
    };

    const getAttachments = async (dofId: string): Promise<DOFAttachment[]> => {
        try {
            const { data, error } = await supabase
                .from('dof_attachments')
                .select('*')
                .eq('dof_id', dofId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (err) {
            console.error('Error fetching attachments:', err);
            return [];
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
        changeStatus,
        addComment,
        addAttachment,
        getComments,
        getAttachments
    };
};
