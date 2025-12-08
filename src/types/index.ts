export interface User {
  id: string;
  email: string;
  display_name: string;
  role: ('personel' | 'sube_kalite' | 'merkez_kalite' | 'admin')[];
  facility_id: number;
  department_id: number | null;
  department_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface DOF {
  id: string;
  tespit_tarihi?: string;
  dof_turu?: 'duzeltici' | 'onleyici';
  tespit_edilen_bolum?: string;
  tespit_edilen_yer?: string;
  dof_kaynagi?: string;
  dof_kategorisi?: string;
  kisa_aciklama?: string;
  dofu_acan?: string;
  sorumlu_bolum?: string;
  tanim?: string;
  dosyalar?: string[];
  title: string;
  description: string;
  facility_id: number;
  reporter_id: string;
  assigned_to: string | null;
  cc_users?: string[];
  status: 'taslak' | 'atanmayı_bekleyen' | 'atanan' | 'çözüm_bekleyen' | 'kapatma_onayında' | 'kapatıldı' | 'iptal' | 'reddedildi';
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  facility?: Facility;
  reporter?: User;
  assignee?: User;
  cc_users_details?: User[];
  comment_count?: number;
  last_comment?: {
    id: string;
    comment: string;
    created_at: string;
    user?: {
      id: string;
      display_name: string;
    };
  };
}

export interface TaskAssignmentData {
  id: string;
  from_user_id: string;
  to_user_id: string;
  facility_id: number;
  dof_ids: string[];
  transfer_date: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export type UserRole = 'personel' | 'sube_kalite' | 'merkez_kalite' | 'admin';

export interface Notification {
  id: string;
  user_id: string;
  type: 'dof_assignment' | 'dof_cc' | 'event_assignment' | 'kanban_assignment' | 'dof_approval_required' | 'status_change';
  title: string;
  message: string;
  related_type: 'dof' | 'event' | 'kanban_card' | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}
