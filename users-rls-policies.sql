-- Users tablosu için RLS politikaları
-- Bu politikalar, yetkili kullanıcıların (admin, merkez_kalite vb.) kullanıcıları yönetmesini sağlar

-- Önce RLS'i etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. Görüntüleme Politikası: Herkes kendi profilini görebilir, yetkililer herkesi görebilir
CREATE POLICY "Users can view own profile or admins can view all" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
    )
  );

-- 2. Ekleme Politikası: Sadece admin ve kalite yöneticileri kullanıcı ekleyebilir
CREATE POLICY "Admins and quality managers can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
    )
  );

-- 3. Güncelleme Politikası: Kişiler kendilerini, yöneticiler başkalarını güncelleyebilir
CREATE POLICY "Users can update own profile or admins can update others" ON users
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
    )
  );

-- 4. Silme Politikası: Sadece adminler silebilir (veya pasife alabilir)
CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin']::text[]
    )
  );
