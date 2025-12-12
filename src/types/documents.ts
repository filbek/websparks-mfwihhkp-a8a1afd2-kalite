import { User, Facility } from './index';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  folder_id?: string;
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
  folder?: DocumentFolder;
  uploader?: User;
  facility?: Facility;
  is_downloadable?: boolean; // New field
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

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  category_id?: string;
  facility_id: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
  creator?: User;
  facility?: Facility;
  parent?: DocumentFolder;
  document_count?: number;
  subfolder_count?: number;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  category_id: string;
  folder_id?: string;
  file: File;
  is_downloadable?: boolean; // New field
}

export interface FolderFormData {
  name: string;
  description?: string;
  parent_id?: string;
  category_id?: string;
}

export interface DocumentFilters {
  category_id?: string;
  folder_id?: string;
  search?: string;
  file_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface FolderFilters {
  category_id?: string;
  parent_id?: string;
  search?: string;
}

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}