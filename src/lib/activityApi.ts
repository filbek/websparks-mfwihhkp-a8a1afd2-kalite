import { supabase } from './supabase';

export interface Activity {
    id: string;
    card_id: string;
    user_id: string;
    action_type: string;
    action_data: any;
    created_at: string;
    user?: {
        id: string;
        display_name: string;
    };
}

// Fetch activity log for a card
export const fetchActivity = async (cardId: string): Promise<Activity[]> => {
    const { data, error } = await supabase
        .from('card_activity')
        .select(`
      *,
      user:users!card_activity_user_id_fkey (
        id,
        display_name
      )
    `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data || [];
};

// Log an activity
export const logActivity = async (
    cardId: string,
    actionType: string,
    actionData?: any
): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) return;

    const { error } = await supabase
        .from('card_activity')
        .insert({
            card_id: cardId,
            user_id: user.id,
            action_type: actionType,
            action_data: actionData || {},
            organization_id: userData.organization_id
        });

    if (error) console.error('Activity log error:', error);
};

// Activity type helpers
export const ActivityTypes = {
    CARD_CREATED: 'card_created',
    CARD_UPDATED: 'card_updated',
    CARD_COMPLETED: 'card_completed',
    CARD_REOPENED: 'card_reopened',
    CARD_MOVED: 'card_moved',
    CHECKLIST_ADDED: 'checklist_added',
    CHECKLIST_ITEM_CHECKED: 'checklist_item_checked',
    CHECKLIST_ITEM_UNCHECKED: 'checklist_item_unchecked',
    ATTACHMENT_ADDED: 'attachment_added',
    ATTACHMENT_DELETED: 'attachment_deleted',
    COMMENT_ADDED: 'comment_added',
    ASSIGNED: 'assigned',
    UNASSIGNED: 'unassigned',
    DUE_DATE_CHANGED: 'due_date_changed',
};
