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

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'quality_note') THEN
    ALTER TABLE events ADD COLUMN quality_note text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'manager_evaluation') THEN
    ALTER TABLE events ADD COLUMN manager_evaluation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'ministry_integration') THEN
    ALTER TABLE events ADD COLUMN ministry_integration boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'hss_code') THEN
    ALTER TABLE events ADD COLUMN hss_code text;
  END IF;
END $$;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_facility_id ON events(facility_id);
CREATE INDEX IF NOT EXISTS idx_events_reporter_id ON events(reporter_id);
CREATE INDEX IF NOT EXISTS idx_events_assigned_to ON events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_hss_code ON events(hss_code);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_score_check') THEN
    ALTER TABLE events ADD CONSTRAINT events_score_check CHECK (score >= 0 AND score <= 7);
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Event owner or assignee can update" ON events;
DROP POLICY IF EXISTS "Event owner can delete" ON events;

CREATE POLICY "Users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id::uuid);

CREATE POLICY "Event owner or assignee can update"
  ON events FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = reporter_id::uuid OR
    auth.uid() = assigned_to::uuid
  )
  WITH CHECK (
    auth.uid() = reporter_id::uuid OR
    auth.uid() = assigned_to::uuid
  );

CREATE POLICY "Event owner can delete"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = reporter_id::uuid);