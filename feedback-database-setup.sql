-- Görüş-Öneri Sistemi Veritabanı Kurulum Script'i
-- Supabase URL: https://vrdpaqndholgfowlcghl.supabase.co

-- 1. Kategoriler Tablosu
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

-- 2. Görüşler Tablosu
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

-- 3. Yanıtlar Tablosu
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Oylar Tablosu
CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_feedback_categories_name ON feedback_categories(name);
CREATE INDEX IF NOT EXISTS idx_feedback_categories_active ON feedback_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_category_id ON feedback_suggestions(category_id);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_status ON feedback_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_priority ON feedback_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_created_at ON feedback_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_facility_id ON feedback_suggestions(facility_id);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_reporter_id ON feedback_suggestions(reporter_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON feedback_responses(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_responder_id ON feedback_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback_id ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_user_id ON feedback_votes(user_id);

-- 6. Updated_at Kolonu İçin Trigger Fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger'ları Oluştur
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

-- 8. View Count Artırma Fonksiyonu
CREATE OR REPLACE FUNCTION increment_feedback_view_count(feedback_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE feedback_suggestions 
    SET view_count = view_count + 1 
    WHERE id = feedback_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Row Level Security (RLS) Politikaları
-- RLS'i Aktif Et
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

-- Kategoriler için RLS
CREATE POLICY "Kategorileri herkes görebilir" ON feedback_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sadece kalite yöneticileri kategorileri yönetebilir" ON feedback_categories
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        current_setting('app.current_user_role', true) IN ('merkez_kalite', 'admin')
    );

-- Görüşler için RLS
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

-- Yanıtlar için RLS
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

-- Oylar için RLS
CREATE POLICY "Oyları authenticated kullanıcılar yönetebilir" ON feedback_votes
    FOR ALL USING (auth.role() = 'authenticated');

-- 10. Varsayılan Kategoriler
INSERT INTO feedback_categories (name, description, icon, color) VALUES
('Hizmet Kalitesi', 'Hizmet kalitesi ile ilgili görüşler', 'bi-star', '#3B82F6'),
('Personel', 'Personel ile ilgili görüşler', 'bi-people', '#10B981'),
('Fiziksel Ortam', 'Hastane fiziksel ortamı', 'bi-building', '#F59E0B'),
('Teknoloji', 'Teknolojik sistemler', 'bi-laptop', '#8B5CF6'),
('Diğer', 'Diğer konulardaki görüşler', 'bi-three-dots', '#6B7280')
ON CONFLICT DO NOTHING;

-- 11. Test Kullanıcıları
-- Dr. Mehmet Yılmaz (Merkez Kalite)
INSERT INTO users (id, email, display_name, role, facility_id, is_active)
VALUES (
  'dr-mehmet-yilmaz-id',
  'mehmet.yilmaz@anadoluhastaneleri.com',
  'Dr. Mehmet Yılmaz',
  ARRAY['merkez_kalite'],
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- Bekir Filizdağ (Şube Kalite)
INSERT INTO users (id, email, display_name, role, facility_id, is_active)
VALUES (
  'bekir-filizdag-id',
  'bekir.filizdag@anadoluhastaneleri.com',
  'Bekir Filizdağ',
  ARRAY['sube_kalite'],
  2,
  true
) ON CONFLICT (id) DO NOTHING;

-- 12. Şube Bilgileri
INSERT INTO facilities (id, name, code, address, phone) VALUES
(1, 'Merkez Şube', 'MERKEZ', 'İstanbul Merkez', '0212 111 11 11'),
(2, 'Silivri Şubesi', 'SILIVRI', 'Silivri, İstanbul', '0212 222 22 22'),
(3, 'Avcılar Şubesi', 'AVCILAR', 'Avcılar, İstanbul', '0212 333 33 33'),
(4, 'Ereğli Şubesi', 'EREGLE', 'Ereğli, Zonguldak', '0372 444 44 44')
ON CONFLICT (id) DO NOTHING;

-- 13. Test Görüşleri
INSERT INTO feedback_suggestions (title, content, category_id, reporter_id, facility_id, priority)
SELECT
  'Hastane otoparkının genişletilmesi',
  'Hastane otoparkının yetersiz olması nedeniyle hasta ve hasta yakınlarının sıkıntı yaşadığı gözlemlenmektedir. Özellikle yoğun saatlerde park yeri bulmakta zorlanılmaktadır.',
  id,
  'bilgehan-batur-id',
  2,
  'yüksek'
FROM feedback_categories
WHERE name = 'Fiziksel Ortam'
LIMIT 1;

INSERT INTO feedback_suggestions (title, content, category_id, reporter_id, facility_id, priority)
SELECT
  'Personel eğitimlerinin düzenlenmesi',
  'Yeni teknolojik cihazların kullanımı için personel eğitimlerinin düzenli olarak yapılması gerekmektedir. Bu sayede hem verimlilik artacak hem de hizmet kalitesi yükselicektir.',
  id,
  'fatma-yilmaz-id',
  3,
  'orta'
FROM feedback_categories
WHERE name = 'Personel'
LIMIT 1;

INSERT INTO feedback_suggestions (title, content, category_id, reporter_id, facility_id, priority)
SELECT
  'Hastane içinde yol yönlendirme tabelalarının iyileştirilmesi',
  'Hastane içinde yön bulmada zorluk yaşayan hastalar için daha belirgin ve anlaşılır tabelaların konulması gerekmektedir.',
  id,
  'zuhal-aktas-id',
  4,
  'orta'
FROM feedback_categories
WHERE name = 'Fiziksel Ortam'
LIMIT 1;

-- 13. Storage için RLS Politikaları
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