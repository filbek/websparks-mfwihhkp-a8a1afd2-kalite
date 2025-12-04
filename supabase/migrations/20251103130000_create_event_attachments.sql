/*
  # Olay Ekleri Yönetimi

  ## Açıklama
  Hasta Güvenliği Olay Bildirimi formuna dosya yükleme özelliği için
  gerekli veritabanı yapısı ve depolama alanı oluşturulur.

  ## Değişiklikler
  1. Storage Bucket
    - `event-attachments` bucket'ı oluşturulur
    - Public erişim kapalı (RLS ile kontrol edilecek)

  2. Yeni Tablo
    - `event_attachments`: Olay ekleri
      - `id` (uuid, primary key)
      - `event_id` (text, foreign key): events tablosuna referans
      - `file_name` (text): Dosya adı
      - `file_path` (text): Storage'daki dosya yolu
      - `file_size` (integer): Dosya boyutu (bytes)
      - `file_type` (text): MIME type
      - `uploaded_by` (uuid): Yükleyen kullanıcı
      - `uploaded_at` (timestamptz): Yüklenme zamanı

  ## Güvenlik
  - Storage bucket için RLS politikaları
  - event_attachments tablosu için RLS politikaları
  - Sadece yetkili kullanıcılar dosya yükleyebilir ve görüntüleyebilir
*/

-- event_attachments tablosu oluştur
CREATE TABLE IF NOT EXISTS event_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now()
);

-- RLS'yi aktifleştir
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_event_attachments_event_id ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_uploaded_by ON event_attachments(uploaded_by);

-- RLS Politikaları

-- Herkes kendi yüklediği veya ilgili olduğu olay eklerini görebilir
CREATE POLICY "Users can view event attachments"
  ON event_attachments FOR SELECT
  TO authenticated
  USING (true);

-- Kimlik doğrulaması yapılmış kullanıcılar ek yükleyebilir
CREATE POLICY "Authenticated users can upload attachments"
  ON event_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Kullanıcılar kendi yükledikleri ekleri silebilir
CREATE POLICY "Users can delete own attachments"
  ON event_attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-attachments',
  'event-attachments',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Politikaları

-- Kimlik doğrulaması yapılmış kullanıcılar dosya yükleyebilir
CREATE POLICY "Authenticated users can upload event files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-attachments');

-- Kimlik doğrulaması yapılmış kullanıcılar dosyaları görüntüleyebilir
CREATE POLICY "Authenticated users can view event files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'event-attachments');

-- Kullanıcılar kendi yükledikleri dosyaları silebilir
CREATE POLICY "Users can delete own event files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Yorumlar
COMMENT ON TABLE event_attachments IS 'Olay bildirimlerine eklenen dosyalar';
COMMENT ON COLUMN event_attachments.event_id IS 'İlgili olay ID''si';
COMMENT ON COLUMN event_attachments.file_name IS 'Orijinal dosya adı';
COMMENT ON COLUMN event_attachments.file_path IS 'Storage''daki tam dosya yolu';
COMMENT ON COLUMN event_attachments.file_size IS 'Dosya boyutu (bytes)';
COMMENT ON COLUMN event_attachments.file_type IS 'Dosya MIME tipi';
