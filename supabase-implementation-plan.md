# Supabase Implementation Planı

## Proje Bilgileri
- **Supabase URL**: https://vrdpaqndholgfowlcghl.supabase.co
- **Anon Public Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHBhcW5kaG9sZ2Zvd2xjZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MzMsImV4cCI6MjA3MzI1MzczM30.QOmgYEhv1WtVm3AYFqqB75iTzCKgA0pDcIw5OI4cA4A

## 1. Proje Kurulumu

### 1.1. Supabase Projesine Bağlanma
1. Supabase dashboard'a gidin: https://vrdpaqndholgfowlcghl.supabase.co
2. SQL Editor bölümüne gidin
3. Aşağıdaki adımları sırayla uygulayın

### 1.2. Mevcut Tabloların Kontrolü
Önce mevcut tabloları kontrol edelim:
```sql
-- Mevcut tabloları listele
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## 2. Görüş-Öneri Sistemi Tabloları

### 2.1. Kategoriler Tablosu
```sql
-- feedback_categories tablosunu oluştur
CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_feedback_categories_name ON feedback_categories(name);
CREATE INDEX IF NOT EXISTS idx_feedback_categories_active ON feedback_categories(is_active);
```

### 2.2. Görüşler Tablosu
```sql
-- feedback_suggestions tablosunu oluştur
CREATE TABLE IF NOT EXISTS feedback_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES feedback_categories(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(255), -- Anonim kullanıcılar için
  reporter_email VARCHAR(255), -- Anonim kullanıcılar için
  reporter_phone VARCHAR(20), -- Anonim kullanıcılar için
  priority VARCHAR(20) DEFAULT 'orta' CHECK (priority IN ('düşük', 'orta', 'yüksek', 'kritik')),
  status VARCHAR(20) DEFAULT 'yeni' CHECK (status IN ('yeni', 'inceleniyor', 'beklemede', 'cozuldu', 'kapatildi')),
  is_anonymous BOOLEAN DEFAULT false,
  facility_id INTEGER NOT NULL,
  department_id INTEGER,
  tags TEXT[], -- Etiketler için array
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_category_id ON feedback_suggestions(category_id);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_status ON feedback_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_priority ON feedback_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_created_at ON feedback_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_facility_id ON feedback_suggestions(facility_id);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_reporter_id ON feedback_suggestions(reporter_id);
```

### 2.3. Yanıtlar Tablosu
```sql
-- feedback_responses tablosunu oluştur
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON feedback_responses(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_responder_id ON feedback_responses(responder_id);
```

### 2.4. Oylar Tablosu
```sql
-- feedback_votes tablosunu oluştur
CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback_id ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_user_id ON feedback_votes(user_id);
```

## 3. Trigger'lar ve Fonksiyonlar

### 3.1. Updated_at Kolonu İçin Trigger
```sql
-- updated_at kolonu için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
DROP TRIGGER IF EXISTS update_feedback_categories_updated_at ON feedback_categories;
CREATE TRIGGER update_feedback_categories_updated_at 
    BEFORE UPDATE ON feedback_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_suggestions_updated_at ON feedback_suggestions;
CREATE TRIGGER update_feedback_suggestions_updated_at 
    BEFORE UPDATE ON feedback_suggestions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_responses_updated_at ON feedback_responses;
CREATE TRIGGER update_feedback_responses_updated_at 
    BEFORE UPDATE ON feedback_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 3.2. View Count Artırma Fonksiyonu
```sql
-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_feedback_view_count(feedback_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE feedback_suggestions 
    SET view_count = view_count + 1 
    WHERE id = feedback_id;
END;
$$ LANGUAGE plpgsql;
```

## 4. Row Level Security (RLS) Politikaları

### 4.1. RLS'i Aktif Et
```sql
-- RLS'i aktif et
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
```

### 4.2. Kategoriler için RLS
```sql
-- Kategoriler için RLS politikaları
CREATE POLICY "Kategorileri herkes görebilir" ON feedback_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sadece kalite yöneticileri kategorileri yönetebilir" ON feedback_categories
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin')
    );
```

### 4.3. Görüşler için RLS
```sql
-- Görüşler için RLS politikaları
CREATE POLICY "Personel kendi şubesindeki görüşleri görebilir" ON feedback_suggestions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (
            current_setting('app.current_user_role', true) = 'personel' AND
            facility_id = current_setting('app.current_user_facility_id', true)::integer
        ) OR
        (
            current_setting('app.current_user_role', true) IN ('sube_kalite', 'merkez_kalite', 'admin')
        )
    );

CREATE POLICY "Personel görüş oluşturabilir" ON feedback_suggestions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            current_setting('app.current_user_role', true) = 'personel' AND
            facility_id = current_setting('app.current_user_facility_id', true)::integer
        ) OR
        (
            current_setting('app.current_user_role', true) IN ('sube_kalite', 'merkez_kalite', 'admin')
        )
    );

CREATE POLICY "Şube kalite kendi şubesindeki görüşleri yönetebilir" ON feedback_suggestions
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        (
            current_setting('app.current_user_role', true) = 'sube_kalite' AND
            facility_id = current_setting('app.current_user_facility_id', true)::integer
        ) OR
        (
            current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin')
        )
    );
```

### 4.4. Yanıtlar için RLS
```sql
-- Yanıtlar için RLS politikaları
CREATE POLICY "Yanıtları yetkili kullanıcılar görebilir" ON feedback_responses
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role', true) IN ('sube_kalite', 'merkez_kalite', 'admin')
    );

CREATE POLICY "Yanıtları yetkili kullanıcılar oluşturabilir" ON feedback_responses
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role', true) IN ('sube_kalite', 'merkez_kalite', 'admin')
    );
```

### 4.5. Oylar için RLS
```sql
-- Oylar için RLS politikaları
CREATE POLICY "Oyları authenticated kullanıcılar yönetebilir" ON feedback_votes
    FOR ALL USING (auth.role() = 'authenticated');
```

## 5. Varsayılan Veriler

### 5.1. Kategoriler
```sql
-- Varsayılan kategorileri ekle
INSERT INTO feedback_categories (name, description, icon, color) VALUES
('Hizmet Kalitesi', 'Hizmet kalitesi ile ilgili görüşler', 'bi-star', '#3B82F6'),
('Personel', 'Personel ile ilgili görüşler', 'bi-people', '#10B981'),
('Fiziksel Ortam', 'Hastane fiziksel ortamı', 'bi-building', '#F59E0B'),
('Teknoloji', 'Teknolojik sistemler', 'bi-laptop', '#8B5CF6'),
('Diğer', 'Diğer konulardaki görüşler', 'bi-three-dots', '#6B7280')
ON CONFLICT DO NOTHING;
```

## 6. Storage Bucket

### 6.1. Bucket Oluşturma
Supabase dashboard'da Storage bölümüne gidin:
1. "New bucket" butonuna tıklayın
2. Bucket adı: `feedback_attachments`
3. Public: false (güvenlik için)
4. "Create bucket" butonuna tıklayın

### 6.2. Storage için RLS
```sql
-- Storage için RLS politikaları
CREATE POLICY "Kullanıcılar dosya yükleyebilir" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'feedback_attachments' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Kullanıcılar kendi dosyalarını görebilir" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'feedback_attachments' AND
        auth.role() = 'authenticated'
    );
```

## 7. Frontend Yapılandırması

### 7.1. Supabase Config
`src/config/supabase.ts` dosyasını güncelleyin:
```typescript
export const supabaseConfig = {
  url: 'https://vrdpaqndholgfowlcghl.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHBhcW5kaG9sZ2Zvd2xjZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MzMsImV4cCI6MjA3MzI1MzczM30.QOmgYEhv1WtVm3AYFqqB75iTzCKgA0pDcIw5OI4cA4A'
};
```

### 7.2. Environment Variables
`.env` dosyasına ekle:
```
VITE_SUPABASE_URL=https://vrdpaqndholgfowlcghl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHBhcW5kaG9sZ2Zvd2xjZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MzMsImV4cCI6MjA3MzI1MzczM30.QOmgYEhv1WtVm3AYFqqB75iTzCKgA0pDcIw5OI4cA4A
```

## 8. Test Verileri

### 8.1. Test Kullanıcısı
```sql
-- Test kullanıcısı oluştur (eğer yoksa)
INSERT INTO users (id, email, display_name, role, facility_id, is_active)
VALUES (
  'test-user-id',
  'test@anadoluhastaneleri.com',
  'Test Kullanıcı',
  ARRAY['sube_kalite'],
  1,
  true
) ON CONFLICT (id) DO NOTHING;
```

### 8.2. Test Görüşleri
```sql
-- Test görüşleri oluştur
INSERT INTO feedback_suggestions (title, content, category_id, reporter_id, facility_id, priority)
SELECT 
  'Test Görüşü ' || generate_series(1, 5),
  'Bu bir test görüşüdür. Sistem tarafından otomatik olarak oluşturulmuştur.',
  id,
  'test-user-id',
  1,
  CASE WHEN generate_series(1, 5) % 2 = 0 THEN 'orta' ELSE 'yüksek' END
FROM feedback_categories
LIMIT 5;
```

## 9. Uygulama Adımları

### 9.1. Sıralı Uygulama
1. **Adım 1**: Mevcut tabloları kontrol et
2. **Adım 2**: Feedback tablolarını oluştur
3. **Adım 3**: Trigger'ları ve fonksiyonları oluştur
4. **Adım 4**: RLS politikalarını uygula
5. **Adım 5**: Varsayılan verileri ekle
6. **Adım 6**: Storage bucket'ı oluştur
7. **Adım 7**: Frontend config'ini güncelle
8. **Adım 8**: Test verilerini ekle

### 9.2. Kontrol Listesi
- [ ] Tüm tablolar oluşturuldu
- [ ] İndeksler oluşturuldu
- [ ] Trigger'lar çalışıyor
- [ ] RLS politikaları aktif
- [ ] Varsayılan kategoriler eklendi
- [ ] Storage bucket oluşturuldu
- [ ] Frontend bağlantısı başarılı
- [ ] Test verileri görünüyor

## 10. Sorun Giderme

### 10.1. Yaygın Sorunlar
1. **RLS Hataları**: Context ayarlarının doğru yapıldığından emin olun
2. **Permission Hataları**: Kullanıcı rollerinin doğru ayarlandığını kontrol edin
3. **Connection Hataları**: Supabase URL ve key'in doğru olduğunu doğrulayın

### 10.2. Debug SQL'ler
```sql
-- Kullanıcı context'ini kontrol et
SELECT current_setting('app.current_user_role', true) as user_role,
       current_setting('app.current_user_facility_id', true) as facility_id;

-- RLS politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('feedback_suggestions', 'feedback_categories', 'feedback_responses', 'feedback_votes');
```

## 11. Güvenlik İpuçları

1. **Anonim Kullanıcılar**: Gerçek kullanıcı bilgilerini asla anonim görüşlerde saklamayın
2. **File Upload**: Dosya türlerini ve boyutlarını mutlaka kontrol edin
3. **RLS**: Her tablo için uygun RLS politikaları oluşturun
4. **Audit**: Önemli işlemler için audit log tutun

Bu planı adım adım uygulayarak Supabase'de Görüş-Öneri sistemini başarıyla kurabilirsiniz.