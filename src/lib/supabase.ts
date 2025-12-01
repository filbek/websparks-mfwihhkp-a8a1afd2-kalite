import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  global: {
    headers: {},
  },
});

export const setSupabaseContext = async (userId: string, userRole: string[], facilityId: number) => {
  const primaryRole = userRole[0];

  try {
    await supabase.rpc('set_user_context', {
      user_id_value: userId,
      user_role_value: primaryRole,
      facility_id_value: facilityId.toString(),
    });
  } catch (error) {
    console.error('Error setting Supabase context:', error);
  }
};

export type Database = {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: number;
          name: string;
          code: string;
          address: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          code: string;
          address: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          code?: string;
          address?: string;
          phone?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          role: string[];
          facility_id: number;
          department_id: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          role: string[];
          facility_id: number;
          department_id?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          role?: string[];
          facility_id?: number;
          department_id?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      dofs: {
        Row: {
          id: string;
          title: string;
          description: string;
          facility_id: number;
          reporter_id: string;
          assigned_to: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          facility_id: number;
          reporter_id: string;
          assigned_to?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          facility_id?: number;
          reporter_id?: string;
          assigned_to?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_type: string;
          facility_id: number;
          reporter_id: string;
          assigned_to: string | null;
          status: string;
          severity: string;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_type: string;
          facility_id: number;
          reporter_id: string;
          assigned_to?: string | null;
          status?: string;
          severity?: string;
          occurred_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          event_type?: string;
          facility_id?: number;
          reporter_id?: string;
          assigned_to?: string | null;
          status?: string;
          severity?: string;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          file_path: string;
          facility_id: number;
          uploaded_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          file_path: string;
          facility_id: number;
          uploaded_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category_id?: string | null;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_path?: string;
          facility_id?: number;
          uploaded_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      feedback_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback_suggestions: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string;
          reporter_id: string | null;
          reporter_name: string | null;
          reporter_email: string | null;
          reporter_phone: string | null;
          priority: string;
          status: string;
          is_anonymous: boolean;
          facility_id: number;
          department_id: number | null;
          tags: string[];
          upvotes: number;
          downvotes: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category_id: string;
          reporter_id?: string | null;
          reporter_name?: string | null;
          reporter_email?: string | null;
          reporter_phone?: string | null;
          priority?: string;
          status?: string;
          is_anonymous?: boolean;
          facility_id: number;
          department_id?: number | null;
          tags?: string[];
          upvotes?: number;
          downvotes?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category_id?: string;
          reporter_id?: string | null;
          reporter_name?: string | null;
          reporter_email?: string | null;
          reporter_phone?: string | null;
          priority?: string;
          status?: string;
          is_anonymous?: boolean;
          facility_id?: number;
          department_id?: number | null;
          tags?: string[];
          upvotes?: number;
          downvotes?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback_responses: {
        Row: {
          id: string;
          feedback_id: string;
          responder_id: string;
          response: string;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          responder_id: string;
          response: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          responder_id?: string;
          response?: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback_votes: {
        Row: {
          id: string;
          feedback_id: string;
          user_id: string;
          vote_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          user_id: string;
          vote_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          user_id?: string;
          vote_type?: string;
          created_at?: string;
        };
      };
    };
  };
};
