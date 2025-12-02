/*
  # Olay Detayları Tablosu Genişletmesi

  ## Açıklama
  Events tablosuna hasta bilgileri, müdürlük atama bilgileri ve kalite yönetimi 
  alanlarını ekleyerek detaylı olay görüntüleme özelliğini destekler.

  ## Yeni Kolonlar (events tablosu)
  ### Hasta Bilgileri
  - `patient_first_name` (text) - Hasta adı
  - `patient_last_name` (text) - Hasta soyadı
  - `patient_tc_no` (text) - TC kimlik numarası
  - `patient_birth_date` (date) - Doğum tarihi
  - `patient_age` (integer) - Yaş
  - `patient_gender` (text) - Cinsiyet (erkek, kadin, diger)
  - `admission_date` (date) - Yatış tarihi
  - `admission_time` (time) - Yatış saati
  - `discharge_date` (date) - Taburcu tarihi
  - `close_reasons` (text[]) - Yakın sebepler (array)
  - `system_errors` (text) - Sistem hataları
  - `error_main_category` (text) - Hata ana başlık
  - `error_sub_category` (text) - Hata alt başlık
  - `related_diagnoses` (text) - Olay ile ilgili hastalık tanıları

  ### Kalite Yönetimi
  - `quality_note` (text) - Kalite notu
  - `quality_closure_note` (text) - Kalite kapatma notu
  - `quality_closure_criteria` (text) - Kalite kapatma kriteri (atanmadi, devam_ediyor, tamamlandi)

  ## Yeni Tablolar
  ### department_assignments
  - Olayların müdürlüklere atanma geçmişini takip eder

  ### error_categories
  - Hata ana başlıkları lookup tablosu

  ### error_sub_categories
  - Hata alt başlıkları lookup tablosu (ana başlığa bağlı)

  ## Güvenlik
  - Tüm tablolarda RLS aktif
  - Authenticated kullanıcılar okuma yetkisine sahip
  - Sadece yetkili kullanıcılar düzenleme yapabilir
*/

-- Events tablosuna hasta bilgileri kolonlarını ekle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_first_name') THEN
    ALTER TABLE events ADD COLUMN patient_first_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_last_name') THEN
    ALTER TABLE events ADD COLUMN patient_last_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_tc_no') THEN
    ALTER TABLE events ADD COLUMN patient_tc_no text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_birth_date') THEN
    ALTER TABLE events ADD COLUMN patient_birth_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_age') THEN
    ALTER TABLE events ADD COLUMN patient_age integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_gender') THEN
    ALTER TABLE events ADD COLUMN patient_gender text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'admission_date') THEN
    ALTER TABLE events ADD COLUMN admission_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'admission_time') THEN
    ALTER TABLE events ADD COLUMN admission_time time;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'discharge_date') THEN
    ALTER TABLE events ADD COLUMN discharge_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'close_reasons') THEN
    ALTER TABLE events ADD COLUMN close_reasons text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'system_errors') THEN
    ALTER TABLE events ADD COLUMN system_errors text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'error_main_category') THEN
    ALTER TABLE events ADD COLUMN error_main_category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'error_sub_category') THEN
    ALTER TABLE events ADD COLUMN error_sub_category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'related_diagnoses') THEN
    ALTER TABLE events ADD COLUMN related_diagnoses text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_note') THEN
    ALTER TABLE events ADD COLUMN quality_note text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_closure_note') THEN
    ALTER TABLE events ADD COLUMN quality_closure_note text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_closure_criteria') THEN
    ALTER TABLE events ADD COLUMN quality_closure_criteria text DEFAULT 'atanmadi';
  END IF;
END $$;

-- Hata kategorileri tablosu
CREATE TABLE IF NOT EXISTS error_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hata alt kategorileri tablosu
CREATE TABLE IF NOT EXISTS error_sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_value text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_main_category FOREIGN KEY (main_category_value) REFERENCES error_categories(value) ON DELETE CASCADE,
  CONSTRAINT unique_main_sub UNIQUE (main_category_value, value)
);

-- Müdürlük atamaları tablosu (foreign key yok, manuel kontrol)
CREATE TABLE IF NOT EXISTS department_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  assigned_department_id uuid,
  assigned_manager_id text,
  manager_name text,
  assignment_status text DEFAULT 'beklemede',
  assigned_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_events_patient_tc ON events(patient_tc_no);
CREATE INDEX IF NOT EXISTS idx_events_patient_name ON events(patient_first_name, patient_last_name);
CREATE INDEX IF NOT EXISTS idx_events_error_category ON events(error_main_category);
CREATE INDEX IF NOT EXISTS idx_events_quality_criteria ON events(quality_closure_criteria);
CREATE INDEX IF NOT EXISTS idx_error_categories_value ON error_categories(value);
CREATE INDEX IF NOT EXISTS idx_error_sub_categories_main ON error_sub_categories(main_category_value);
CREATE INDEX IF NOT EXISTS idx_department_assignments_event ON department_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_department_assignments_manager ON department_assignments(assigned_manager_id);

-- RLS Politikaları

-- Hata kategorileri
ALTER TABLE error_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active error categories"
  ON error_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage error categories"
  ON error_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- Hata alt kategorileri
ALTER TABLE error_sub_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active error sub categories"
  ON error_sub_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage error sub categories"
  ON error_sub_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- Müdürlük atamaları
ALTER TABLE department_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view department assignments"
  ON department_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kalite users can create assignments"
  ON department_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('merkez_kalite' = ANY(users.role) OR 'sube_kalite' = ANY(users.role) OR 'admin' = ANY(users.role))
    )
  );

CREATE POLICY "Kalite users can update assignments"
  ON department_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('merkez_kalite' = ANY(users.role) OR 'sube_kalite' = ANY(users.role) OR 'admin' = ANY(users.role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('merkez_kalite' = ANY(users.role) OR 'sube_kalite' = ANY(users.role) OR 'admin' = ANY(users.role))
    )
  );

-- Trigger fonksiyonu varsa kullan
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_error_categories_updated_at
      BEFORE UPDATE ON error_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_error_sub_categories_updated_at
      BEFORE UPDATE ON error_sub_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_department_assignments_updated_at
      BEFORE UPDATE ON department_assignments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Seed data: Hata kategorileri
INSERT INTO error_categories (value, label, display_order) VALUES
  ('iletisim_hatalari', 'İletişim Hataları', 1),
  ('dokumantasyon_hatalari', 'Dokümantasyon Hataları', 2),
  ('ilac_hatalari', 'İlaç Hataları', 3),
  ('cerrahi_hatalari', 'Cerrahi Hatalar', 4),
  ('cihaz_hatalari', 'Cihaz ve Ekipman Hataları', 5),
  ('enfeksiyon_kontrol', 'Enfeksiyon Kontrol Hataları', 6),
  ('dusme_yaralanma', 'Düşme ve Yaralanma', 7),
  ('tani_tedavi_hatalari', 'Tanı ve Tedavi Hataları', 8)
ON CONFLICT (value) DO NOTHING;

-- Seed data: Hata alt kategorileri
INSERT INTO error_sub_categories (main_category_value, value, label, display_order) VALUES
  ('iletisim_hatalari', 'hekim_hemsire', 'Hekim-Hemşire İletişimi', 1),
  ('iletisim_hatalari', 'hasta_hekim', 'Hasta-Hekim İletişimi', 2),
  ('iletisim_hatalari', 'birim_arasi', 'Birimler Arası İletişim', 3),
  ('dokumantasyon_hatalari', 'eksik_kayit', 'Eksik Kayıt', 1),
  ('dokumantasyon_hatalari', 'yanlis_kayit', 'Yanlış Kayıt', 2),
  ('dokumantasyon_hatalari', 'gecikme', 'Gecikmeli Kayıt', 3),
  ('ilac_hatalari', 'yanlis_ilac', 'Yanlış İlaç', 1),
  ('ilac_hatalari', 'yanlis_doz', 'Yanlış Doz', 2),
  ('ilac_hatalari', 'yanlis_yol', 'Yanlış Uygulama Yolu', 3),
  ('ilac_hatalari', 'yanlis_hasta', 'Yanlış Hasta', 4),
  ('cerrahi_hatalari', 'yanlis_bolge', 'Yanlış Bölge', 1),
  ('cerrahi_hatalari', 'yanlis_hasta', 'Yanlış Hasta', 2),
  ('cerrahi_hatalari', 'yanlis_islem', 'Yanlış İşlem', 3),
  ('cihaz_hatalari', 'arizali_cihaz', 'Arızalı Cihaz', 1),
  ('cihaz_hatalari', 'yanlis_kullanim', 'Yanlış Kullanım', 2),
  ('cihaz_hatalari', 'bakim_eksikligi', 'Bakım Eksikliği', 3),
  ('enfeksiyon_kontrol', 'el_hijyeni', 'El Hijyeni Eksikliği', 1),
  ('enfeksiyon_kontrol', 'sterilizasyon', 'Sterilizasyon Hatası', 2),
  ('enfeksiyon_kontrol', 'izolasyon', 'İzolasyon Kurallarına Uyumsuzluk', 3),
  ('dusme_yaralanma', 'hasta_dusme', 'Hasta Düşmesi', 1),
  ('dusme_yaralanma', 'yatak_yaralanma', 'Yatak Kaynaklı Yaralanma', 2),
  ('dusme_yaralanma', 'transfer_yaralanma', 'Transfer Sırasında Yaralanma', 3),
  ('tani_tedavi_hatalari', 'gec_tani', 'Geç Tanı', 1),
  ('tani_tedavi_hatalari', 'yanlis_tani', 'Yanlış Tanı', 2),
  ('tani_tedavi_hatalari', 'uygunsuz_tedavi', 'Uygunsuz Tedavi', 3)
ON CONFLICT (main_category_value, value) DO NOTHING;
