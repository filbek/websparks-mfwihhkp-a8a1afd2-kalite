/*
  # Hasta Güvenliği Olay Bildirimi Formu - Veritabanı Güncelleme

  ## Açıklama
  Bu migration, hasta güvenliği olay bildirimi formundaki yeni alanları ekler.
  Görüntüdeki form tasarımına göre tüm gerekli alanlar eklenmektedir.

  ## Yeni Alanlar
  
  ### Temel Bilgiler
  - `privacy_request` (boolean): Gizlilik talebi (Hayır/Evet)
  - `working_department` (text): Çalıştığı bölüm
  - `patient_type` (text): Hasta tipi (Yatan Hasta, Ayaktan Hasta, Ziyaretçi, vb.)
  - `patient_number` (text): Hasta numarası
  - `gender` (text): Cinsiyet (Erkek/Kadın)
  - `affected_person_name` (text): Olaydan etkilenenin adı soyadı
  - `birth_date` (date): Doğum tarihi
  - `admission_date` (date): Yatış tarihi
  - `reporter_name` (text): Olayı bildiren adı soyadı
  
  ### Olay Detayları
  - `event_date` (date): Olay tarihi
  - `event_time` (time): Olay saati
  - `entry_date` (timestamptz): Olay giriş tarihi (otomatik)
  - `repeat_count` (integer): Olay gerçekleşme sayısı (tekrar sayısı)
  - `score` (integer): Puanlama (0-7)
  - `event_class` (text): Olay sınıfı
  - `main_category` (text): Ana başlık
  - `sub_category` (text): Alt başlık
  - `location` (text): Gerçekleştiği yer
  - `event_category` (text): Olay tipi
  - `responsible_profession` (text): Hatayı yapanın mesleği
  
  ### Olay Açıklaması
  - `event_details` (text): Olayın ayrıntıları
  - `suggestions` (text): Olaya ilişkin görüş ve öneriler
  - `is_medication_error` (boolean): İlaç hatası mı?
  - `medication_name` (text): İlaç adı (opsiyonel)
  
  ### Değerlendirme Notları
  - `quality_note` (text): Kalite notu
  - `manager_evaluation` (text): Yönetici değerlendirme notu
  - `ministry_integration` (boolean): Bakanlık entegrasyonu yapıldı

  ## Güvenlik
  - Mevcut RLS politikaları korunur
  - Yeni alanlar için ek politika gerekmez
*/

-- Mevcut events tablosuna yeni alanları ekle
DO $$
BEGIN
  -- Temel Bilgiler alanları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'privacy_request') THEN
    ALTER TABLE events ADD COLUMN privacy_request boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'working_department') THEN
    ALTER TABLE events ADD COLUMN working_department text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_type') THEN
    ALTER TABLE events ADD COLUMN patient_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_number') THEN
    ALTER TABLE events ADD COLUMN patient_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'gender') THEN
    ALTER TABLE events ADD COLUMN gender text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_person_name') THEN
    ALTER TABLE events ADD COLUMN affected_person_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'birth_date') THEN
    ALTER TABLE events ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'admission_date') THEN
    ALTER TABLE events ADD COLUMN admission_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'reporter_name') THEN
    ALTER TABLE events ADD COLUMN reporter_name text;
  END IF;

  -- Olay Detayları alanları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date') THEN
    ALTER TABLE events ADD COLUMN event_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_time') THEN
    ALTER TABLE events ADD COLUMN event_time time;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'entry_date') THEN
    ALTER TABLE events ADD COLUMN entry_date timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'repeat_count') THEN
    ALTER TABLE events ADD COLUMN repeat_count integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'score') THEN
    ALTER TABLE events ADD COLUMN score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_class') THEN
    ALTER TABLE events ADD COLUMN event_class text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'main_category') THEN
    ALTER TABLE events ADD COLUMN main_category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sub_category') THEN
    ALTER TABLE events ADD COLUMN sub_category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE events ADD COLUMN location text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_category') THEN
    ALTER TABLE events ADD COLUMN event_category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'responsible_profession') THEN
    ALTER TABLE events ADD COLUMN responsible_profession text;
  END IF;

  -- Olay Açıklaması alanları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_details') THEN
    ALTER TABLE events ADD COLUMN event_details text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'suggestions') THEN
    ALTER TABLE events ADD COLUMN suggestions text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_medication_error') THEN
    ALTER TABLE events ADD COLUMN is_medication_error boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'medication_name') THEN
    ALTER TABLE events ADD COLUMN medication_name text;
  END IF;

  -- Değerlendirme Notları alanları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_note') THEN
    ALTER TABLE events ADD COLUMN quality_note text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'manager_evaluation') THEN
    ALTER TABLE events ADD COLUMN manager_evaluation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'ministry_integration') THEN
    ALTER TABLE events ADD COLUMN ministry_integration boolean DEFAULT false;
  END IF;
END $$;

-- Score değerinin 0-7 arasında olmasını sağlayan constraint ekle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_score_check') THEN
    ALTER TABLE events ADD CONSTRAINT events_score_check CHECK (score >= 0 AND score <= 7);
  END IF;
END $$;