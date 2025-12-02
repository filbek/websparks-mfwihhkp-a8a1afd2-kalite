/*
  # Çalışan Güvenliği Olay Bildirimi Formu - Yeni Alanlar

  ## Açıklama
  Bu migration, çalışan güvenliği olay bildirimi formuna referans görseldeki
  eksik alanları ekler ve formu hasta güvenliği formuna benzer şekilde kapsamlaştırır.

  ## Yeni Alanlar

  ### Kurum Bilgileri
  - `facility_location` (text): Olayın gerçekleştiği kurum
  - `facility_sub_location` (text): Kurum alt kırılım
  
  ### Olay Sınıflandırması
  - `event_class_detail` (text): Olay sınıfı detayı
  - `primary_cause_detail` (text): Öncelikli sebep alt kırılım
  
  ### Bildirim ve İşlem Durumları
  - `unwanted_event_reported` (boolean): İstenmeyen olay bildirimi yapıldı mı
  - `work_accident_reported` (boolean): İş kazası bildirimi yapıldı mı
  - `white_code_initiated` (boolean): Beyaz kod süreci başlatıldı mı
  - `legal_action_status` (text): Hukuki işlem durumu (başlatıldı/başlatılmadı)

  ## Güvenlik
  - Mevcut RLS politikaları korunur
  - Yeni alanlar için ek politika gerekmez

  ## Notlar
  - Tüm alanlar opsiyoneldir
  - Boolean alanlar için default değer false
*/

-- Kurum Bilgileri alanları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'facility_location') THEN
    ALTER TABLE events ADD COLUMN facility_location text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'facility_sub_location') THEN
    ALTER TABLE events ADD COLUMN facility_sub_location text;
  END IF;
END $$;

-- Olay Sınıflandırması alanları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_class_detail') THEN
    ALTER TABLE events ADD COLUMN event_class_detail text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'primary_cause_detail') THEN
    ALTER TABLE events ADD COLUMN primary_cause_detail text;
  END IF;
END $$;

-- Bildirim ve İşlem Durumları alanları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'unwanted_event_reported') THEN
    ALTER TABLE events ADD COLUMN unwanted_event_reported boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'work_accident_reported') THEN
    ALTER TABLE events ADD COLUMN work_accident_reported boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'white_code_initiated') THEN
    ALTER TABLE events ADD COLUMN white_code_initiated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'legal_action_status') THEN
    ALTER TABLE events ADD COLUMN legal_action_status text;
  END IF;
END $$;

-- Yorumlar ekle
COMMENT ON COLUMN events.facility_location IS 'Olayın gerçekleştiği kurum';
COMMENT ON COLUMN events.facility_sub_location IS 'Kurum alt kırılım';
COMMENT ON COLUMN events.event_class_detail IS 'Olay sınıfı detayı';
COMMENT ON COLUMN events.primary_cause_detail IS 'Öncelikli sebep alt kırılım';
COMMENT ON COLUMN events.unwanted_event_reported IS 'İstenmeyen olay bildirimi yapıldı mı';
COMMENT ON COLUMN events.work_accident_reported IS 'İş kazası bildirimi yapıldı mı';
COMMENT ON COLUMN events.white_code_initiated IS 'Beyaz kod süreci başlatıldı mı';
COMMENT ON COLUMN events.legal_action_status IS 'Hukuki işlem durumu: başlatıldı, başlatılmadı';
