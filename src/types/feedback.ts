export interface FeedbackCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackSuggestion {
  id: string;
  title: string;
  content: string;
  category_id: string;
  reporter_id?: string;
  reporter_name?: string; // Anonim kullanıcılar için
  reporter_email?: string;
  reporter_phone?: string;
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  status: 'yeni' | 'inceleniyor' | 'beklemede' | 'cozuldu' | 'kapatildi';
  is_anonymous: boolean;
  facility_id: number;
  department_id?: number;
  tags: string[];
  upvotes: number;
  downvotes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  category?: FeedbackCategory;
  reporter?: User;
  facility?: Facility;
  responses?: FeedbackResponse[];
  vote_count?: number; // upvotes - downvotes
}

export interface FeedbackResponse {
  id: string;
  feedback_id: string;
  responder_id: string;
  response: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  responder?: User;
}

export interface FeedbackVote {
  id: string;
  feedback_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface FeedbackFormData {
  title: string;
  content: string;
  category_id: string;
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  is_anonymous: boolean;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  tags: string[];
}

export interface FeedbackFilters {
  category_id?: string;
  status?: string;
  priority?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  facility_id?: number;
  reporter_id?: string;
}

// Import User and Facility from main types
import { User, Facility } from './index';