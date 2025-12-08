import { supabase } from './supabase';

export interface Board {
    id: string;
    title: string;
    user_id: string;
    created_at: string;
}

export interface List {
    id: string;
    board_id: string;
    title: string;
    position: number;
    created_at: string;
}

export interface Card {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
    due_date?: string;
    assigned_to?: string;
    is_completed?: boolean;
    completed_at?: string;
    completed_by?: string;
    created_at: string;
    created_by?: string;
}

export interface BoardWithData {
    board: Board;
    lists: (List & { cards: Card[] })[];
}

// Board operations
export const fetchBoards = async (): Promise<Board[]> => {
    const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const fetchBoardData = async (boardId: string): Promise<BoardWithData> => {
    // Fetch board
    const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

    if (boardError) throw boardError;

    // Fetch lists
    const { data: lists, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

    if (listsError) throw listsError;

    // Fetch cards for all lists
    const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('list_id', lists?.map(l => l.id) || [])
        .order('position', { ascending: true });

    if (cardsError) throw cardsError;

    // Group cards by list
    const listsWithCards = (lists || []).map(list => ({
        ...list,
        cards: (cards || []).filter(card => card.list_id === list.id),
    }));

    return {
        board,
        lists: listsWithCards,
    };
};

export const createBoard = async (title: string): Promise<Board> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Get organization_id
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    const { data, error } = await supabase
        .from('boards')
        .insert({
            title,
            user_id: user.id,
            organization_id: userData.organization_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateBoard = async (id: string, updates: Partial<Board>): Promise<Board> => {
    const { data, error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteBoard = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// List operations
export const createList = async (boardId: string, title: string, position: number): Promise<List> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Get organization_id
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    const { data, error } = await supabase
        .from('lists')
        .insert({
            board_id: boardId,
            title,
            position,
            organization_id: userData.organization_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateList = async (id: string, updates: Partial<List>): Promise<List> => {
    const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteList = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateListPosition = async (listId: string, position: number): Promise<void> => {
    const { error } = await supabase
        .from('lists')
        .update({ position })
        .eq('id', listId);

    if (error) throw error;
};

// Card operations
export const createCard = async (listId: string, cardData: Partial<Card>): Promise<Card> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Get organization_id
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) throw new Error('Organizasyon bulunamadı');

    const { data, error } = await supabase
        .from('cards')
        .insert({
            list_id: listId,
            ...cardData,
            organization_id: userData.organization_id,
            created_by: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateCard = async (id: string, updates: Partial<Card>): Promise<Card> => {
    const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteCard = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateCardPosition = async (
    cardId: string,
    listId: string,
    position: number
): Promise<void> => {
    const { error } = await supabase
        .from('cards')
        .update({ list_id: listId, position })
        .eq('id', cardId);

    if (error) throw error;
};

// Toggle card completion
export const toggleCardCompletion = async (cardId: string, isCompleted: boolean): Promise<Card> => {
    const { data: { user } } = await supabase.auth.getUser();

    const updates: Partial<Card> = {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : undefined,
        completed_by: isCompleted && user ? user.id : undefined,
    };

    const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

