/*
  # Events Tablosu Tüm Kolonlarının Kontrolü ve Eklenmesi

  ## Açıklama
  Bu migration, events tablosunda olması gereken tüm kolonların varlığını kontrol eder
  ve eksik olanları ekler. Bu sayede önceki migration'lar çalıştırılmamış olsa bile
  tablo tam olarak hazır hale gelir.

  ## Değişiklikler
  - Tüm gerekli kolonları kontrol eder ve ekler
  - Mevcut kolonları değiştirmez
  - İndeksleri oluşturur
  - Constraints ekler

  ## Güvenlik
  - Mevcut RLS politikaları korunur
*/

-- Events tablosunun varlığını kontrol et ve oluştur
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type text NOT NULL,
  event_code text,
  department text,
  facility_id integer NOT NULL DEFAULT 1,
  reporter_id text,
  assigned_to text,
  status text NOT NULL DEFAULT 'taslak',
  job_title text,
  damage_status text,
  impact_duration text,
  legal_action boolean DEFAULT false,
  closed_at timestamptz,
  close_duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hasta Güvenliği form alanlarını ekle
DO $$
BEGIN
  -- privacy_request
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'privacy_request') THEN
    ALTER TABLE events ADD COLUMN privacy_request boolean DEFAULT false;
  END IF;

  -- working_department
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'working_department') THEN
    ALTER TABLE events ADD COLUMN working_department text;
  END IF;

  -- patient_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_type') THEN
    ALTER TABLE events ADD COLUMN patient_type text;
  END IF;

  -- patient_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'patient_number') THEN
    ALTER TABLE events ADD COLUMN patient_number text;
  END IF;

  -- gender
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'gender') THEN
    ALTER TABLE events ADD COLUMN gender text;
  END IF;

  -- affected_person_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'affected_person_name') THEN
    ALTER TABLE events ADD COLUMN affected_person_name text;
  END IF;

  -- birth_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'birth_date') THEN
    ALTER TABLE events ADD COLUMN birth_date date;
  END IF;

  -- admission_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'admission_date') THEN
    ALTER TABLE events ADD COLUMN admission_date date;
  END IF;

  -- reporter_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'reporter_name') THEN
    ALTER TABLE events ADD COLUMN reporter_name text;
  END IF;

  -- event_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date') THEN
    ALTER TABLE events ADD COLUMN event_date date;
  END IF;

  -- event_time
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_time') THEN
    ALTER TABLE events ADD COLUMN event_time time;
  END IF;

  -- entry_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'entry_date') THEN
    ALTER TABLE events ADD COLUMN entry_date timestamptz DEFAULT now();
  END IF;

  -- repeat_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'repeat_count') THEN
    ALTER TABLE events ADD COLUMN repeat_count integer DEFAULT 1;
  END IF;

  -- score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'score') THEN
    ALTER TABLE events ADD COLUMN score integer DEFAULT 0;
  END IF;

  -- event_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_class') THEN
    ALTER TABLE events ADD COLUMN event_class text;
  END IF;

  -- main_category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'main_category') THEN
    ALTER TABLE events ADD COLUMN main_category text;
  END IF;

  -- sub_category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sub_category') THEN
    ALTER TABLE events ADD COLUMN sub_category text;
  END IF;

  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE events ADD COLUMN location text;
  END IF;

  -- event_category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_category') THEN
    ALTER TABLE events ADD COLUMN event_category text;
  END IF;

  -- responsible_profession
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'responsible_profession') THEN
    ALTER TABLE events ADD COLUMN responsible_profession text;
  END IF;

  -- event_details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_details') THEN
    ALTER TABLE events ADD COLUMN event_details text;
  END IF;

  -- suggestions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'suggestions') THEN
    ALTER TABLE events ADD COLUMN suggestions text;
  END IF;

  -- is_medication_error
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_medication_error') THEN
    ALTER TABLE events ADD COLUMN is_medication_error boolean DEFAULT false;
  END IF;

  -- medication_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'medication_name') THEN
    ALTER TABLE events ADD COLUMN medication_name text;
  END IF;

  -- quality_note
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_note') THEN
    ALTER TABLE events ADD COLUMN quality_note text;
  END IF;

  -- manager_evaluation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'manager_evaluation') THEN
    ALTER TABLE events ADD COLUMN manager_evaluation text;
  END IF;

  -- ministry_integration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'ministry_integration') THEN
    ALTER TABLE events ADD COLUMN ministry_integration boolean DEFAULT false;
  END IF;

  -- hss_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'hss_code') THEN
    ALTER TABLE events ADD COLUMN hss_code text;
  END IF;
END $$;

-- RLS'yi aktifleştir
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_facility_id ON events(facility_id);
CREATE INDEX IF NOT EXISTS idx_events_reporter_id ON events(reporter_id);
CREATE INDEX IF NOT EXISTS idx_events_assigned_to ON events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_hss_code ON events(hss_code);

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_score_check') THEN
    ALTER TABLE events ADD CONSTRAINT events_score_check CHECK (score >= 0 AND score <= 7);
  END IF;
END $$;

-- RLS Politikalarını kontrol et ve oluştur
DO $$
BEGIN
  -- View policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Users can view all events'
  ) THEN
    CREATE POLICY "Users can view all events"
      ON events FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Authenticated users can create events'
  ) THEN
    CREATE POLICY "Authenticated users can create events"
      ON events FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid()::text = reporter_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Event owner or assignee can update'
  ) THEN
    CREATE POLICY "Event owner or assignee can update"
      ON events FOR UPDATE
      TO authenticated
      USING (
        auth.uid()::text = reporter_id OR
        auth.uid()::text = assigned_to
      )
      WITH CHECK (
        auth.uid()::text = reporter_id OR
        auth.uid()::text = assigned_to
      );
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Event owner can delete'
  ) THEN
    CREATE POLICY "Event owner can delete"
      ON events FOR DELETE
      TO authenticated
      USING (auth.uid()::text = reporter_id);
  END IF;
END $$;
