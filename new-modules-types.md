# Yeni Modüller TypeScript Tipleri

## 1. Görüş-Öneri Sistemi Tipleri

### FeedbackCategory
```typescript
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
```

### FeedbackSuggestion
```typescript
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
```

### FeedbackResponse
```typescript
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
```

### FeedbackVote
```typescript
export interface FeedbackVote {
  id: string;
  feedback_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}
```

### FeedbackFormData
```typescript
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
```

### FeedbackFilters
```typescript
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
```

## 2. Şikayet Yönetimi CRM Tipleri

### ComplaintCategory
```typescript
export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  sla_hours: number;
  is_active: boolean;
  created_at: string;
  
  // Joined fields
  children?: ComplaintCategory[];
  parent?: ComplaintCategory;
}
```

### Complaint
```typescript
export interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  
  // Müşteri bilgileri
  complainant_name: string;
  complainant_email?: string;
  complainant_phone?: string;
  complainant_type: 'hasta' | 'hasta_yakini' | 'personel' | 'diger';
  
  // Şikayet detayları
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik' | 'acil';
  urgency: 'dusuk' | 'normal' | 'yuksek' | 'acil';
  status: 'yeni' | 'atanmayi_bekleyen' | 'inceleniyor' | 'cozum_surecinde' | 'cozuldu' | 'kapatildi' | 'iptal';
  
  // Atama bilgileri
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: string;
  
  // Zaman bilgileri
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  
  // Konum ve bağlam
  facility_id: number;
  department_id?: number;
  location?: string;
  
  // Ek bilgiler
  tags: string[];
  attachments: string[];
  
  // Müşteri memnuniyeti
  satisfaction_rating?: number;
  satisfaction_comment?: string;
  
  reporter_id: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  category?: ComplaintCategory;
  subcategory?: ComplaintCategory;
  assignee?: User;
  assigner?: User;
  facility?: Facility;
  responses?: ComplaintResponse[];
  assignments?: ComplaintAssignment[];
  survey?: ComplaintSatisfactionSurvey;
  
  // Computed fields
  is_overdue?: boolean;
  resolution_time_hours?: number;
}
```

### ComplaintAssignment
```typescript
export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  assigned_to: string;
  assigned_by: string;
  notes?: string;
  status: 'aktif' | 'pasif' | 'iptal';
  assigned_at: string;
  unassigned_at?: string;
  
  // Joined fields
  assignee?: User;
  assigner?: User;
}
```

### ComplaintResponse
```typescript
export interface ComplaintResponse {
  id: string;
  complaint_id: string;
  responder_id: string;
  response: string;
  response_type: 'not' | 'email' | 'telefon' | 'yuz_yuze';
  is_internal: boolean;
  is_customer_visible: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  responder?: User;
}
```

### ComplaintSatisfactionSurvey
```typescript
export interface ComplaintSatisfactionSurvey {
  id: string;
  complaint_id: string;
  survey_sent_at?: string;
  survey_completed_at?: string;
  overall_rating?: number;
  resolution_time_rating?: number;
  staff_attitude_rating?: number;
  communication_rating?: number;
  additional_comments?: string;
  would_recommend?: boolean;
  created_at: string;
}
```

### ComplaintFormData
```typescript
export interface ComplaintFormData {
  title: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  complainant_name: string;
  complainant_email?: string;
  complainant_phone?: string;
  complainant_type: 'hasta' | 'hasta_yakini' | 'personel' | 'diger';
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik' | 'acil';
  urgency: 'dusuk' | 'normal' | 'yuksek' | 'acil';
  facility_id: number;
  department_id?: number;
  location?: string;
  tags: string[];
}
```

### ComplaintFilters
```typescript
export interface ComplaintFilters {
  category_id?: string;
  subcategory_id?: string;
  status?: string;
  priority?: string;
  urgency?: string;
  assigned_to?: string;
  complainant_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  facility_id?: number;
  is_overdue?: boolean;
}
```

## 3. Eğitim Yönetim Sistemi Tipleri

### TrainingCategory
```typescript
export interface TrainingCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}
```

### TrainingProgram
```typescript
export interface TrainingProgram {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  training_type: 'online' | 'yuz_yuze' | 'hibrit';
  duration_hours?: number;
  max_participants?: number;
  min_participants: number;
  is_mandatory: boolean;
  is_active: boolean;
  tags: string[];
  prerequisites: string[];
  learning_objectives: string[];
  
  // Sertifika bilgileri
  provides_certificate: boolean;
  certificate_template?: string;
  passing_score: number;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  category?: TrainingCategory;
  creator?: User;
  sessions?: TrainingSession[];
  materials?: TrainingMaterial[];
  
  // Computed fields
  total_sessions?: number;
  total_participants?: number;
  completion_rate?: number;
}
```

### TrainingSession
```typescript
export interface TrainingSession {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  
  // Zaman bilgileri
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  
  // Lokasyon bilgileri
  location?: string;
  online_meeting_url?: string;
  meeting_room?: string;
  
  // Eğitmen bilgileri
  instructor_id?: string;
  assistant_instructors: string[];
  
  // Katılım bilgileri
  max_participants?: number;
  current_participants: number;
  is_cancelled: boolean;
  cancellation_reason?: string;
  
  // Durum
  status: 'planlandi' | 'kayit_acik' | 'dolu' | 'basladi' | 'tamamlandi' | 'iptal';
  
  facility_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  program?: TrainingProgram;
  instructor?: User;
  assistants?: User[];
  facility?: Facility;
  participants?: TrainingParticipant[];
  materials?: TrainingMaterial[];
  
  // Computed fields
  is_registration_open?: boolean;
  is_full?: boolean;
  days_until_start?: number;
  can_register?: boolean;
}
```

### TrainingParticipant
```typescript
export interface TrainingParticipant {
  id: string;
  session_id: string;
  participant_id: string;
  
  // Kayıt bilgileri
  registered_at: string;
  registered_by: string;
  
  // Katılım bilgileri
  attendance_status: 'kayitli' | 'katildi' | 'katilmadi' | 'iptal';
  attended_at?: string;
  
  // Değerlendirme bilgileri
  completion_status: 'baslamadi' | 'devam_ediyor' | 'tamamlandi' | 'basarisiz';
  score?: number;
  max_score?: number;
  percentage?: number;
  
  // Sertifika bilgileri
  certificate_issued: boolean;
  certificate_issued_at?: string;
  certificate_url?: string;
  
  // Geri bildirim
  feedback_rating?: number;
  feedback_comment?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  session?: TrainingSession;
  participant?: User;
  registrar?: User;
  
  // Computed fields
  is_completed?: boolean;
  can_download_certificate?: boolean;
}
```

### TrainingMaterial
```typescript
export interface TrainingMaterial {
  id: string;
  program_id?: string;
  session_id?: string;
  
  title: string;
  description?: string;
  material_type: 'document' | 'video' | 'presentation' | 'link' | 'quiz';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  external_url?: string;
  
  order_index: number;
  is_mandatory: boolean;
  is_visible: boolean;
  
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  program?: TrainingProgram;
  session?: TrainingSession;
  uploader?: User;
}
```

### TrainingQuiz
```typescript
export interface TrainingQuiz {
  id: string;
  program_id?: string;
  session_id?: string;
  
  title: string;
  description?: string;
  time_limit_minutes?: number;
  max_attempts: number;
  passing_score: number;
  shuffle_questions: boolean;
  show_results: boolean;
  
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  program?: TrainingProgram;
  session?: TrainingSession;
  creator?: User;
  questions?: TrainingQuizQuestion[];
  attempts?: TrainingQuizAttempt[];
  
  // Computed fields
  total_questions?: number;
  total_points?: number;
}
```

### TrainingQuizQuestion
```typescript
export interface TrainingQuizQuestion {
  id: string;
  quiz_id: string;
  
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: any[]; // JSONB
  correct_answer?: string;
  points: number;
  explanation?: string;
  
  order_index: number;
  created_at: string;
}
```

### TrainingQuizAttempt
```typescript
export interface TrainingQuizAttempt {
  id: string;
  quiz_id: string;
  participant_id: string;
  
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  time_spent_minutes?: number;
  
  score?: number;
  max_score?: number;
  percentage?: number;
  passed?: boolean;
  
  answers?: any; // JSONB
  created_at: string;
  
  // Joined fields
  quiz?: TrainingQuiz;
  participant?: User;
}
```

### TrainingFormData
```typescript
export interface TrainingProgramFormData {
  title: string;
  description?: string;
  category_id: string;
  training_type: 'online' | 'yuz_yuze' | 'hibrit';
  duration_hours?: number;
  max_participants?: number;
  min_participants?: number;
  is_mandatory: boolean;
  tags: string[];
  prerequisites: string[];
  learning_objectives: string[];
  provides_certificate: boolean;
  certificate_template?: string;
  passing_score: number;
}

export interface TrainingSessionFormData {
  program_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  location?: string;
  online_meeting_url?: string;
  meeting_room?: string;
  instructor_id?: string;
  assistant_instructors: string[];
  max_participants?: number;
  facility_id: number;
}
```

### TrainingFilters
```typescript
export interface TrainingFilters {
  category_id?: string;
  training_type?: string;
  status?: string;
  instructor_id?: string;
  facility_id?: number;
  is_mandatory?: boolean;
  provides_certificate?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}
```

## 4. Ortak Tipler ve Enum'lar

### Status Enum'lar
```typescript
export type FeedbackStatus = 'yeni' | 'inceleniyor' | 'beklemede' | 'cozuldu' | 'kapatildi';
export type ComplaintStatus = 'yeni' | 'atanmayi_bekleyen' | 'inceleniyor' | 'cozum_surecinde' | 'cozuldu' | 'kapatildi' | 'iptal';
export type TrainingStatus = 'planlandi' | 'kayit_acik' | 'dolu' | 'basladi' | 'tamamlandi' | 'iptal';
export type AttendanceStatus = 'kayitli' | 'katildi' | 'katilmadi' | 'iptal';
export type CompletionStatus = 'baslamadi' | 'devam_ediyor' | 'tamamlandi' | 'basarisiz';
```

### Priority Enum'lar
```typescript
export type Priority = 'düşük' | 'orta' | 'yüksek' | 'kritik';
export type ComplaintPriority = 'düşük' | 'orta' | 'yüksek' | 'kritik' | 'acil';
export type Urgency = 'dusuk' | 'normal' | 'yuksek' | 'acil';
```

### Chart Data Types
```typescript
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface DashboardStats {
  total_feedback: number;
  pending_feedback: number;
  resolved_feedback: number;
  total_complaints: number;
  pending_complaints: number;
  overdue_complaints: number;
  total_trainings: number;
  active_trainings: number;
  completed_trainings: number;
  total_participants: number;
}
```

### Notification Types
```typescript
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: 'feedback' | 'complaint' | 'training';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}
```

### API Response Types
```typescript
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 5. Form Validation Types

### Validation Rules
```typescript
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}
```

### Form State Types
```typescript
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}
```

## 6. Component Props Types

### Table Props
```typescript
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T) => void;
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
}
```

### Filter Props
```typescript
export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterProps {
  options: FilterOption[];
  value?: string | number | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
}
```

## 7. Export All Types
```typescript
// Feedback types
export type {
  FeedbackCategory,
  FeedbackSuggestion,
  FeedbackResponse,
  FeedbackVote,
  FeedbackFormData,
  FeedbackFilters
} from './feedback';

// Complaint types
export type {
  ComplaintCategory,
  Complaint,
  ComplaintAssignment,
  ComplaintResponse,
  ComplaintSatisfactionSurvey,
  ComplaintFormData,
  ComplaintFilters
} from './complaint';

// Training types
export type {
  TrainingCategory,
  TrainingProgram,
  TrainingSession,
  TrainingParticipant,
  TrainingMaterial,
  TrainingQuiz,
  TrainingQuizQuestion,
  TrainingQuizAttempt,
  TrainingFormData,
  TrainingFilters
} from './training';

// Common types
export type {
  Priority,
  ComplaintPriority,
  Urgency,
  FeedbackStatus,
  ComplaintStatus,
  TrainingStatus,
  AttendanceStatus,
  CompletionStatus,
  ChartData,
  DashboardStats,
  Notification,
  ApiResponse,
  PaginatedResponse,
  ValidationRule,
  ValidationRules,
  FormErrors,
  FormState,
  TableColumn,
  TableProps,
  FilterOption,
  FilterProps
} from './common';