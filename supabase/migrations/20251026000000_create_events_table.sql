/*
  # Olay Yönetim Sistemi - Events Tablosu

  ## Açıklama
  Hasta güvenliği, çalışan güvenliği ve acil durum olaylarını yönetmek için
  temel events tablosu ve ilgili yapıları oluşturur.

  ## Yeni Tablo
  - `events`: Tüm olay kayıtları
    - `id` (text, primary key): Benzersiz olay ID'si
    - `event_type` (text): Olay tipi (hasta_guvenlik, calisan_guvenlik, acil_durum)
    - `event_code` (text): Olay kodu (örn: HG-2024-001)
    - `department` (text): İlgili bölüm
    - `facility_id` (integer): Tesis ID'si
    - `reporter_id` (text): Bildirimi yapan kullanıcı ID'si
    - `assigned_to` (text): Atanan kullanıcı ID'si
    - `status` (text): Olay durumu
    - `job_title` (text): Çalışan güvenliği için meslek unvanı
    - `damage_status` (text): Hasar durumu
    - `impact_duration` (text): Etki süresi
    - `legal_action` (boolean): Yasal işlem
    - `closed_at` (timestamptz): Kapatılma zamanı
    - `close_duration` (integer): Kapatma süresi (dakika)
    - `created_at` (timestamptz): Oluşturulma zamanı
    - `updated_at` (timestamptz): Güncellenme zamanı

  ## Güvenlik
  - RLS aktif
  - Authenticated kullanıcılar kendi olaylarını görebilir
  - Authenticated kullanıcılar olay oluşturabilir
  - Atanan kullanıcılar olayları güncelleyebilir
*/

-- Events tablosunu oluştur
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

-- RLS'yi aktifleştir
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_facility_id ON events(facility_id);
CREATE INDEX IF NOT EXISTS idx_events_reporter_id ON events(reporter_id);
CREATE INDEX IF NOT EXISTS idx_events_assigned_to ON events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- RLS Politikaları

-- Authenticated kullanıcılar tüm olayları görebilir
CREATE POLICY "Users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated kullanıcılar olay oluşturabilir
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = reporter_id);

-- Olay sahibi veya atanan kullanıcı güncelleyebilir
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

-- Olay sahibi silebilir
CREATE POLICY "Event owner can delete"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid()::text = reporter_id);

-- Yorumlar
COMMENT ON TABLE events IS 'Hasta güvenliği, çalışan güvenliği ve acil durum olayları';
COMMENT ON COLUMN events.event_type IS 'Olay tipi: hasta_guvenlik, calisan_guvenlik, acil_durum';
COMMENT ON COLUMN events.status IS 'Olay durumu: taslak, atanmayi_bekleyen, atanan, cozum_bekleyen, kapatma_onayinda, kapatildi, reddedildi, iptal';
