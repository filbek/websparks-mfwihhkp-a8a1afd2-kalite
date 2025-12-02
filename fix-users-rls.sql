-- Önceki hatalı politikaları temizle (Sonsuz döngüye neden olanlar)
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Admins and quality managers can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile or admins can update others" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- 1. Görüntüleme Politikası: Sonsuz döngüyü önlemek için tüm giriş yapmış kullanıcılar okuyabilir
-- Bu değişiklik, giriş yaparken "Kullanıcı profili bulunamadı" hatasını çözer
CREATE POLICY "Authenticated users can view all profiles" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Ekleme Politikası: Rol kontrolü (SELECT politikası düzeltildiği için artık çalışır)
CREATE POLICY "Admins and quality managers can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
    )
  );

-- 3. Güncelleme Politikası
CREATE POLICY "Users can update own profile or admins can update others" ON users
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
    )
  );

-- 4. Silme Politikası
CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role && ARRAY['admin']::text[]
    )
  );
