import { supabase } from './supabase';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    settings: any;
    subscription_plan: string;
    subscription_status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Get current user's organization
export const getCurrentOrganization = async (): Promise<Organization | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) return null;

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

    if (error) throw error;
    return data;
};

// Get all organizations (super admin only)
export const getAllOrganizations = async (): Promise<Organization[]> => {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
};

// Get organization by slug (subdomain)
export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return data;
};

// Create new organization
export const createOrganization = async (
    name: string,
    slug: string
): Promise<Organization> => {
    const { data, error } = await supabase
        .from('organizations')
        .insert({
            name,
            slug,
            subscription_plan: 'basic',
            subscription_status: 'trial',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update organization
export const updateOrganization = async (
    id: string,
    updates: Partial<Organization>
): Promise<Organization> => {
    const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Set current organization context for RLS
export const setOrganizationContext = async (organizationId: string): Promise<void> => {
    const { error } = await supabase.rpc('set_config', {
        setting: 'app.current_org_id',
        value: organizationId,
    });

    if (error) console.error('Error setting organization context:', error);
};
