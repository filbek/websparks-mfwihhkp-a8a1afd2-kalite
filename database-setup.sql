-- Doküman Yönetim Sistemi için Veritabanı Kurulum Script'i

-- 1. Doküman kategorileri tablosu
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Dokümanlar tablosu
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

-- 3. İndeksler
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_facility_id ON documents(facility_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_categories_parent_id ON document_categories(parent_id);

-- 4. RLS (Row Level Security) Politikaları
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- 5. Dokümanlar için RLS politikası
CREATE POLICY "Users can view documents based on their role" ON documents
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      CASE 
        WHEN current_setting('app.current_user_role', true) = 'personel' THEN is_active = true
        WHEN current_setting('app.current_user_role', true) = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id', true)::integer
        ELSE true
      END
    )
  );

CREATE POLICY "Users can insert documents based on their role" ON documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      CASE 
        WHEN current_setting('app.current_user_role', true) = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id', true)::integer
        WHEN current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin') THEN 
          true
        ELSE false
      END
    )
  );

CREATE POLICY "Users can update documents based on their role" ON documents
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      CASE 
        WHEN current_setting('app.current_user_role', true) = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id', true)::integer
        WHEN current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin') THEN 
          true
        ELSE false
      END
    )
  );

CREATE POLICY "Users can delete documents based on their role" ON documents
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      CASE 
        WHEN current_setting('app.current_user_role', true) = 'sube_kalite' THEN 
          facility_id = current_setting('app.current_user_facility_id', true)::integer
        WHEN current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin') THEN 
          true
        ELSE false
      END
    )
  );

-- 6. Kategoriler için RLS politikası
CREATE POLICY "All authenticated users can view categories" ON document_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only quality managers and admins can manage categories" ON document_categories
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin')
  );

-- 7. Varsayılan kategorileri ekle
INSERT INTO document_categories (name, description) VALUES
('Kalite Prosedürleri', 'Hastane kalite standartları ve prosedürleri'),
('Politika Dokümanları', 'Hastane politikaları ve yönergeler'),
('Formlar', 'Kalite formları ve şablonları'),
('Eğitim Materyalleri', 'Personel eğitim dokümanları'),
('Denetim Raporları', 'İç ve dış denetim raporları'),
('Sertifikalar', 'Hastane sertifikaları ve belgeleri');

-- 8. Fonksiyonlar ve Trigger'lar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Storage Bucket için SQL (Supabase dashboard üzerinden manuel olarak oluşturulmalı)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false);

-- 10. Storage için RLS politikaları
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

CREATE POLICY "Users can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );