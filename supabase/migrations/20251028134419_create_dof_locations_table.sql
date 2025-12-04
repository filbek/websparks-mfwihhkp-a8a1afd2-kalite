/*
  # DÖF Yerler/Bölümler Tablosu Oluşturma

  ## Açıklama
  Bu migration, DÖF formlarında kullanılacak hastane bölümleri/yerleri için 
  dinamik bir yönetim sistemi oluşturur.

  ## Yeni Tablo
  1. `dof_locations` (DÖF Tespit Edilen Yerler/Bölümler)
     - `id` (uuid, primary key)
     - `value` (text, unique) - Sistem kodu (örn: bashekimlik)
     - `label` (text) - Görünen ad (örn: Başhekimlik)
     - `is_active` (boolean) - Aktif/pasif durumu
     - `display_order` (integer) - Sıralama
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Güvenlik
  - RLS etkinleştirildi
  - Tüm kimlik doğrulaması yapılmış kullanıcılar aktif kayıtları okuyabilir
  - Sadece admin kullanıcılar ekleyebilir, güncelleyebilir ve silebilir

  ## Özellikler
  - 22 hastane bölümü ile başlangıç verisi yüklendi
  - Otomatik updated_at güncelleme trigger'ı eklendi
  - Performans için indeksler oluşturuldu
*/

-- DÖF Locations Tablosu
CREATE TABLE IF NOT EXISTS dof_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_dof_locations_value ON dof_locations(value);
CREATE INDEX IF NOT EXISTS idx_dof_locations_active ON dof_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_dof_locations_display_order ON dof_locations(display_order);

-- RLS Politikaları
ALTER TABLE dof_locations ENABLE ROW LEVEL SECURITY;

-- Herkes aktif kayıtları okuyabilir
CREATE POLICY "Anyone can read active dof locations"
  ON dof_locations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Adminler tüm kayıtları okuyabilir (Settings sayfası için)
CREATE POLICY "Admins can read all dof locations"
  ON dof_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    )
  );

-- Adminler yeni kayıt ekleyebilir
CREATE POLICY "Admins can insert dof locations"
  ON dof_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    )
  );

-- Adminler kayıtları güncelleyebilir
CREATE POLICY "Admins can update dof locations"
  ON dof_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    )
  );

-- Adminler kayıtları silebilir
CREATE POLICY "Admins can delete dof locations"
  ON dof_locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    )
  );

-- Updated_at otomatik güncelleme trigger'ı
CREATE TRIGGER update_dof_locations_updated_at
  BEFORE UPDATE ON dof_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Başlangıç Verileri - 22 Hastane Bölümü
INSERT INTO dof_locations (value, label, display_order) VALUES
  ('bashekimlik', 'Başhekimlik', 1),
  ('hastane_mudurlugu', 'Hastane Müdürlüğü', 2),
  ('mali_ve_idari_isler_mudurlugu', 'Mali ve İdari İşler Müdürlüğü', 3),
  ('insan_kaynaklari_birimi', 'İnsan Kaynakları Birimi', 4),
  ('finans_ve_muhasebe_birimi', 'Finans ve Muhasebe Birimi', 5),
  ('satin_alma_ve_lojistik_birimi', 'Satın Alma ve Lojistik Birimi', 6),
  ('kalite_ve_hasta_guvenligi_birimi', 'Kalite ve Hasta Güvenliği Birimi', 7),
  ('bilgi_islem_birimi', 'Bilgi İşlem (IT) Birimi', 8),
  ('teknik_servis_bakim_onarim_birimi', 'Teknik Servis / Bakım Onarım Birimi', 9),
  ('guvenlik_hizmetleri', 'Güvenlik Hizmetleri', 10),
  ('temizlik_ve_hijyen_birimi', 'Temizlik ve Hijyen Birimi', 11),
  ('yemekhane_ve_iase_hizmetleri', 'Yemekhane ve İaşe Hizmetleri', 12),
  ('hasta_kayit_kabul_birimi', 'Hasta Kayıt / Kabul Birimi', 13),
  ('hasta_haklari_birimi', 'Hasta Hakları Birimi', 14),
  ('danisma_ve_resepsiyon', 'Danışma ve Resepsiyon', 15),
  ('saglik_turizmi_uluslararasi_hasta_birimi', 'Sağlık Turizmi / Uluslararası Hasta Birimi', 16),
  ('sigorta_ve_faturalama_birimi', 'Sigorta ve Faturalama Birimi', 17),
  ('kurumsal_iletisim_ve_pazarlama_birimi', 'Kurumsal İletişim ve Pazarlama Birimi', 18),
  ('ar_ge_ve_proje_gelistirme_birimi', 'Ar-Ge ve Proje Geliştirme Birimi', 19),
  ('egitim_birimi', 'Eğitim Birimi', 20),
  ('arsiv_ve_dokumantasyon_birimi', 'Arşiv ve Dokümantasyon Birimi', 21),
  ('diger', 'Diğer', 22)
ON CONFLICT (value) DO NOTHING;
