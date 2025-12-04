/*
  # Görüş ve Öneri Kategorileri Tablosu

  1. Yeni Tablolar
    - `feedback_categories`
      - `id` (uuid, primary key) - Kategori benzersiz kimliği
      - `name` (text, not null) - Kategori adı
      - `description` (text) - Kategori açıklaması
      - `color` (text) - Kategori renk kodu
      - `is_active` (boolean) - Kategori aktif mi
      - `created_at` (timestamptz) - Oluşturulma zamanı
      - `updated_at` (timestamptz) - Güncellenme zamanı

  2. Güvenlik
    - RLS etkinleştirildi
    - Kimlik doğrulaması yapılmış kullanıcılar kategorileri görüntüleyebilir

  3. Varsayılan Veriler
    - İstek
    - Öneri
    - Şikayet
    - Teşekkür
*/

CREATE TABLE IF NOT EXISTS feedback_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view feedback categories"
  ON feedback_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert feedback categories"
  ON feedback_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update feedback categories"
  ON feedback_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Varsayılan kategorileri ekle
INSERT INTO feedback_categories (name, description, color) VALUES
  ('İstek', 'Yeni özellik veya hizmet talepleri', '#3B82F6'),
  ('Öneri', 'İyileştirme ve geliştirme önerileri', '#10B981'),
  ('Şikayet', 'Sorun ve memnuniyetsizlik bildirimleri', '#EF4444'),
  ('Teşekkür', 'Takdir ve teşekkür mesajları', '#F59E0B')
ON CONFLICT DO NOTHING;