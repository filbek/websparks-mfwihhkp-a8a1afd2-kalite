import { supabase } from './supabase';
import { User } from '../types';

export interface AssignedTask {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    list_title: string;
    board_title: string;
    board_id: string;
    list_id: string;
    assigned_by?: string;
}

// Fetch all tasks assigned to the current user
export const fetchMyAssignedTasks = async (): Promise<AssignedTask[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('cards')
        .select(`
      id,
      title,
      description,
      due_date,
      list_id,
      lists!inner (
        id,
        title,
        board_id,
        boards!inner (
          id,
          title,
          user_id
        )
      )
    `)
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;

    return (data || []).map((card: any) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        due_date: card.due_date,
        list_id: card.lists.id,
        list_title: card.lists.title,
        board_id: card.lists.boards.id,
        board_title: card.lists.boards.title,
        assigned_by: card.lists.boards.user_id,
    }));
};

// Admin: Fetch all tasks with optional filters
export const fetchAllAssignedTasks = async (filters?: {
    assignedTo?: string;
    boardId?: string;
    searchQuery?: string;
}): Promise<AssignedTask[]> => {
    let query = supabase
        .from('cards')
        .select(`
      id,
      title,
      description,
      due_date,
      assigned_to,
      list_id,
      lists!inner (
        id,
        title,
        board_id,
        boards!inner (
          id,
          title,
          user_id
        )
      )
    `)
        .not('assigned_to', 'is', null);

    // Apply filters
    if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters?.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    query = query.order('due_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((card: any) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        due_date: card.due_date,
        list_id: card.lists.id,
        list_title: card.lists.title,
        board_id: card.lists.boards.id,
        board_title: card.lists.boards.title,
        assigned_by: card.lists.boards.user_id,
    }));
};

// Fetch all active users
export const fetchAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true);

    if (error) throw error;
    return data as User[];
};
