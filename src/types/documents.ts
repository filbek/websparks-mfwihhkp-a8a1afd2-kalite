export interface Document {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  facility_id: number;
  uploaded_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
  uploader?: User;
  facility?: Facility;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  children?: DocumentCategory[];
  document_count?: number;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  category_id: string;
  file: File;
}

export interface DocumentFilters {
  category_id?: string;
  search?: string;
  file_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}