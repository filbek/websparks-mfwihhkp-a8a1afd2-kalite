import { supabase } from './supabase';

export interface Checklist {
    id: string;
    card_id: string;
    title: string;
    position: number;
    created_at: string;
    items?: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    checklist_id: string;
    title: string;
    is_completed: boolean;
    position: number;
    created_at: string;
}

// Fetch all checklists for a card with their items
export const fetchChecklists = async (cardId: string): Promise<Checklist[]> => {
    const { data: checklists, error: checklistsError } = await supabase
        .from('card_checklists')
        .select('*')
        .eq('card_id', cardId)
        .order('position', { ascending: true });

    if (checklistsError) throw checklistsError;

    const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('checklist_id', (checklists || []).map(c => c.id))
        .order('position', { ascending: true });

    if (itemsError) throw itemsError;

    return (checklists || []).map(checklist => ({
        ...checklist,
        items: (items || []).filter(item => item.checklist_id === checklist.id),
    }));
};

// Create a new checklist
export const createChecklist = async (cardId: string, title: string): Promise<Checklist> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    const { data: checklists } = await supabase
        .from('card_checklists')
        .select('position')
        .eq('card_id', cardId)
        .order('position', { ascending: false })
        .limit(1);

    const position = checklists && checklists.length > 0 ? checklists[0].position + 1 : 0;

    const { data, error } = await supabase
        .from('card_checklists')
        .insert({
            card_id: cardId,
            title,
            position,
            organization_id: userData.organization_id
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, items: [] };
};

// Update checklist
export const updateChecklist = async (id: string, updates: Partial<Checklist>): Promise<Checklist> => {
    const { data, error } = await supabase
        .from('card_checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete checklist
export const deleteChecklist = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('card_checklists')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Create checklist item
export const createChecklistItem = async (checklistId: string, title: string): Promise<ChecklistItem> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    const { data: items } = await supabase
        .from('checklist_items')
        .select('position')
        .eq('checklist_id', checklistId)
        .order('position', { ascending: false })
        .limit(1);

    const position = items && items.length > 0 ? items[0].position + 1 : 0;

    const { data, error } = await supabase
        .from('checklist_items')
        .insert({
            checklist_id: checklistId,
            title,
            position,
            organization_id: userData.organization_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Toggle checklist item completion
export const toggleChecklistItem = async (itemId: string, isCompleted: boolean): Promise<ChecklistItem> => {
    const { data, error } = await supabase
        .from('checklist_items')
        .update({ is_completed: isCompleted })
        .eq('id', itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update checklist item
export const updateChecklistItem = async (itemId: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> => {
    const { data, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete checklist item
export const deleteChecklistItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

    if (error) throw error;
};
