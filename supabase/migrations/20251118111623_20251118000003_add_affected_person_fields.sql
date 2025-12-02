/*
  # Etkilenen Kişi Bilgileri Ekleme

  ## Açıklama
  Events tablosuna olaydan etkilenen kişi bilgilerini ve eksik detayları ekler.
  Görüntüdeki "Olaydan Etkilenen" tablosu için gerekli alanlar.

  ## Yeni Kolonlar
  ### Etkilenen Kişi Bilgileri
  - `affected_person_type` (text) - Etkilenen kişi tipi (hasta, calisan, ziyaretci, diger)
  - `affected_first_name` (text) - Etkilenen kişi adı
  - `affected_last_name` (text) - Etkilenen kişi soyadı
  - `affected_tc_no` (text) - Etkilenen kişi TC no
  - `affected_birth_date` (date) - Etkilenen kişi doğum tarihi
  - `affected_gender` (text) - Etkilenen kişi cinsiyet
  - `affected_contact_phone` (text) - Etkilenen kişi telefon
  - `affected_contact_email` (text) - Etkilenen kişi email

  ### Ek Olay Detayları
  - `event_location_detail` (text) - Olay yerinin detaylı açıklaması
  - `witnesses` (text) - Olay tanıkları
  - `immediate_actions_taken` (text) - Hemen alınan önlemler
  - `risk_assessment` (text) - Risk değerlendirmesi
  - `contributing_factors` (text) - Katkıda bulunan faktörler
*/

DO $$
BEGIN
  -- Etkilenen kişi bilgileri
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_person_type') THEN
    ALTER TABLE events ADD COLUMN affected_person_type text DEFAULT 'hasta';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_first_name') THEN
    ALTER TABLE events ADD COLUMN affected_first_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_last_name') THEN
    ALTER TABLE events ADD COLUMN affected_last_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_tc_no') THEN
    ALTER TABLE events ADD COLUMN affected_tc_no text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_birth_date') THEN
    ALTER TABLE events ADD COLUMN affected_birth_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_gender') THEN
    ALTER TABLE events ADD COLUMN affected_gender text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_contact_phone') THEN
    ALTER TABLE events ADD COLUMN affected_contact_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_contact_email') THEN
    ALTER TABLE events ADD COLUMN affected_contact_email text;
  END IF;

  -- Ek olay detayları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_location_detail') THEN
    ALTER TABLE events ADD COLUMN event_location_detail text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'witnesses') THEN
    ALTER TABLE events ADD COLUMN witnesses text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'immediate_actions_taken') THEN
    ALTER TABLE events ADD COLUMN immediate_actions_taken text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'risk_assessment') THEN
    ALTER TABLE events ADD COLUMN risk_assessment text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'contributing_factors') THEN
    ALTER TABLE events ADD COLUMN contributing_factors text;
  END IF;
END $$;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_events_affected_person ON events(affected_first_name, affected_last_name);
CREATE INDEX IF NOT EXISTS idx_events_affected_tc ON events(affected_tc_no);

-- Yorumlar
COMMENT ON COLUMN events.affected_person_type IS 'Etkilenen kişi tipi: hasta, calisan, ziyaretci, diger';
COMMENT ON COLUMN events.affected_first_name IS 'Etkilenen kişi adı';
COMMENT ON COLUMN events.affected_last_name IS 'Etkilenen kişi soyadı';
COMMENT ON COLUMN events.affected_tc_no IS 'Etkilenen kişi TC kimlik numarası';
COMMENT ON COLUMN events.affected_birth_date IS 'Etkilenen kişi doğum tarihi';
COMMENT ON COLUMN events.affected_gender IS 'Etkilenen kişi cinsiyet';
COMMENT ON COLUMN events.affected_contact_phone IS 'Etkilenen kişi telefon';
COMMENT ON COLUMN events.affected_contact_email IS 'Etkilenen kişi email';
COMMENT ON COLUMN events.event_location_detail IS 'Olay yerinin detaylı açıklaması';
COMMENT ON COLUMN events.witnesses IS 'Olay tanıkları';
COMMENT ON COLUMN events.immediate_actions_taken IS 'Hemen alınan önlemler';
COMMENT ON COLUMN events.risk_assessment IS 'Risk değerlendirmesi';
COMMENT ON COLUMN events.contributing_factors IS 'Katkıda bulunan faktörler';
