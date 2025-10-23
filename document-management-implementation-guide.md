# Doküman Yönetim Sistemi Implementation Guide

## 1. Veritabanı Şeması SQL Script

```sql
-- Doküman kategorileri tablosu
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dokümanlar tablosu
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_facility_id ON documents(facility_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_categories_parent_id ON document_categories(parent_id);

-- RLS (Row Level Security) Politikaları
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- Dokümanlar için RLS politikası
CREATE POLICY "Users can view documents based on their role" ON documents
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Personel sadece aktif dokümanları görebilir
      -- Şube kalite kendi şubesinin dokümanlarını görebilir
      -- Merkez kalite ve admin tüm dokümanları görebilir
      CASE 
        WHEN current_setting('app.current_user_role') = 'personel' THEN is_active = true
        WHEN current_setting('app.current_user_role') = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id')::integer
        ELSE true
      END
    )
  );

CREATE POLICY "Users can insert documents based on their role" ON documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Personel doküman yükleyemez
      -- Şube kalite kendi şubesine doküman yükleyebilir
      -- Merkez kalite ve admin her şubeye doküman yükleyebilir
      CASE 
        WHEN current_setting('app.current_user_role') = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id')::integer
        WHEN current_setting('app.current_user_role') IN ('merkez_kalite', 'admin') THEN 
          true
        ELSE false
      END
    )
  );

-- Varsayılan kategorileri ekle
INSERT INTO document_categories (name, description) VALUES
('Kalite Prosedürleri', 'Hastane kalite standartları ve prosedürleri'),
('Politika Dokümanları', 'Hastane politikaları ve yönergeler'),
('Formlar', 'Kalite formları ve şablonları'),
('Eğitim Materyalleri', 'Personel eğitim dokümanları'),
('Denetim Raporları', 'İç ve dış denetim raporları'),
('Sertifikalar', 'Hastane sertifikaları ve belgeleri');
```

## 2. TypeScript Tipleri

```typescript
// src/types/documents.ts
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

// src/lib/supabase.ts dosyasına eklenecek tablo tipleri
export type Database = {
  public: {
    Tables: {
      // ... mevcut tablolar
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
    };
  };
};
```

## 3. API Hook'ları

```typescript
// src/hooks/useDocuments.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document, DocumentFormData, DocumentFilters } from '../types/documents';

export const useDocuments = (filters?: DocumentFilters) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(*),
          uploader:users(id, display_name),
          facility:facilities(id, name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Filtreleri uygula
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.file_type) {
        query = query.eq('file_type', filters.file_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dokümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (formData: DocumentFormData): Promise<Document> => {
    try {
      // Önce dosyayı Supabase Storage'a yükle
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Veritabanına doküman kaydını ekle
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          file_name: formData.file.name,
          file_type: formData.file.type,
          file_size: formData.file.size,
          file_path: filePath,
          facility_id: 1, // Bu değer kullanıcı context'ten alınmalı
          uploaded_by: 'current-user-id', // Bu değer auth context'ten alınmalı
        })
        .select()
        .single();

      if (error) throw error;

      // Doküman listesini güncelle
      await fetchDocuments();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman yüklenirken hata oluştu');
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Önce doküman bilgilerini al
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Storage'dan dosyayı sil
      if (document?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) throw storageError;
      }

      // Veritabanından kaydı sil
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Doküman listesini güncelle
      await fetchDocuments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman silinirken hata oluştu');
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Dosyayı indirme
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doküman indirilirken hata oluştu');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: fetchDocuments,
  };
};

// src/hooks/useDocumentCategories.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DocumentCategory } from '../types/documents';

export const useDocumentCategories = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
```

## 4. Ana Sayfa Bileşeni

```typescript
// src/pages/DocumentManagement.tsx
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { SearchBar } from '../components/documents/SearchBar';
import { CategoryFilter } from '../components/documents/CategoryFilter';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentCategories } from '../hooks/useDocumentCategories';
import { DocumentFilters } from '../types/documents';

export const DocumentManagement: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  
  const { documents, loading, error, uploadDocument, deleteDocument, downloadDocument } = useDocuments(filters);
  const { categories } = useDocumentCategories();

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleUploadDocument = async (formData: any) => {
    try {
      await uploadDocument(formData);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Doküman yükleme hatası:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Doküman Yönetimi</h1>
            <p className="text-secondary-600">Kalite dokümanlarını yönetin ve paylaşın</p>
          </div>
          
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <i className="bi bi-plus-lg mr-2"></i>
            Yeni Doküman Yükle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar onSearch={(search) => handleFilterChange({ search })} />
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category_id}
            onCategoryChange={(category_id) => handleFilterChange({ category_id })}
          />
        </div>
      </div>

      {/* Document List */}
      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        onDelete={deleteDocument}
        onDownload={downloadDocument}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Doküman Yükle"
        size="lg"
      >
        <DocumentUpload
          categories={categories}
          onSubmit={handleUploadDocument}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
```

## 5. Navigasyon Güncellemeleri

```typescript
// src/App.tsx dosyasında güncelleme
import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DOFManagement } from './pages/DOFManagement';
import { EventReporting } from './pages/EventReporting';
import { DocumentManagement } from './pages/DocumentManagement';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'committees' | 'reports' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dof-management':
        return <DOFManagement />;
      case 'event-reporting':
        return <EventReporting />;
      case 'document-management':
        return <DocumentManagement />;
      default:
        return <Dashboard />;
    }
  };

  // ... geri kalan kod aynı kalacak
}

// src/components/layout/Sidebar.tsx dosyasında güncelleme
const menuItems = [
  { id: 'dashboard' as Page, icon: 'bi-speedometer2', label: 'Dashboard' },
  { id: 'dof-management' as Page, icon: 'bi-clipboard-check', label: 'DÖF Yönetimi' },
  { id: 'event-reporting' as Page, icon: 'bi-exclamation-triangle', label: 'Olay Bildirimi' },
  { id: 'document-management' as Page, icon: 'bi-file-earmark-text', label: 'Doküman Yönetimi' },
  { id: 'committees' as Page, icon: 'bi-people', label: 'Komiteler' },
  { id: 'reports' as Page, icon: 'bi-bar-chart', label: 'Raporlar' },
  { id: 'settings' as Page, icon: 'bi-gear', label: 'Ayarlar' }
];

// src/components/layout/Header.tsx dosyasında güncelleme
const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: 'bi-speedometer2' },
  { id: 'dof-management' as Page, label: 'DÖF Yönetimi', icon: 'bi-clipboard-check' },
  { id: 'event-reporting' as Page, label: 'Olay Bildirimi', icon: 'bi-exclamation-triangle' },
  { id: 'document-management' as Page, label: 'Doküman Yönetimi', icon: 'bi-file-earmark-text' },
  { id: 'committees' as Page, label: 'Komiteler', icon: 'bi-people' },
  { id: 'reports' as Page, label: 'Raporlar', icon: 'bi-bar-chart' }
];
```

## 6. Supabase Storage Bucket Oluşturma

```sql
-- Supabase Storage'da 'documents' bucket'ı oluşturmak için
-- Bu işlem Supabase dashboard üzerinden manuel olarak yapılmalıdır
-- veya aşağıdaki SQL kullanılabilir:

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Bucket için RLS politikaları
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can download documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );
```

Bu implementation guide, doküman yönetim sisteminin temel bileşenlerini oluşturmak için gerekli kod örneklerini ve yapılandırmaları içerir. Geliştirme sürecinde bu rehber kullanılarak sistemin adım adım oluşturulabilir.