import { supabase } from './supabase';

export interface Attachment {
    id: string;
    card_id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string;
    uploaded_by: string;
    created_at: string;
}

const BUCKET_NAME = 'card-attachments';

// Upload file to Supabase Storage
export const uploadFile = async (file: File, cardId: string): Promise<Attachment> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${cardId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    // Get organization_id
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    // Save attachment record
    const { data, error } = await supabase
        .from('card_attachments')
        .insert({
            card_id: cardId,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
            organization_id: userData.organization_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Fetch all attachments for a card
export const fetchAttachments = async (cardId: string): Promise<Attachment[]> => {
    const { data, error } = await supabase
        .from('card_attachments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// Delete attachment
export const deleteAttachment = async (id: string, fileUrl: string): Promise<void> => {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === BUCKET_NAME);
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (storageError) console.error('Storage deletion error:', storageError);

    // Delete record
    const { error } = await supabase
        .from('card_attachments')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Get signed URL for private files (if needed)
export const getSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
};
