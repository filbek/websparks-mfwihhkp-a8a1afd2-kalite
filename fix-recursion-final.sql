-- BU SCRIPT'I SUPABASE SQL EDITOR'DE ÇALIŞTIRIN
-- Bu script, "infinite recursion" (sonsuz döngü) hatasını kesin olarak çözer.

-- 1. Güvenli Rol Kontrol Fonksiyonu (Security Definer)
-- Bu fonksiyon RLS politikalarından etkilenmeden kullanıcının rolünü getirir.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER -- Bu satır çok önemli: RLS'i bypass eder
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$;

-- 2. Mevcut tüm politikaları temizle (Hata almamak için IF EXISTS kullanıyoruz)
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins and quality managers can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile or admins can update others" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
DROP POLICY IF EXISTS "view_users" ON users;
DROP POLICY IF EXISTS "insert_users" ON users;
DROP POLICY IF EXISTS "update_users" ON users;
DROP POLICY IF EXISTS "delete_users" ON users;

-- 3. Yeni, Güvenli Politikaları Oluştur

-- GÖRÜNTÜLEME: Giriş yapmış herkes kullanıcı listesini görebilir
-- (Atama yapmak ve listelemek için gereklidir)
CREATE POLICY "view_users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- EKLEME: Sadece Admin ve Kalite Yöneticileri
-- get_my_role() fonksiyonu sayesinde sonsuz döngüye girmez
CREATE POLICY "insert_users" ON users
  FOR INSERT WITH CHECK (
    public.get_my_role() && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
  );

-- GÜNCELLEME: Kişinin kendisi VEYA Admin/Kalite Yöneticileri
CREATE POLICY "update_users" ON users
  FOR UPDATE USING (
    auth.uid() = id OR
    public.get_my_role() && ARRAY['admin', 'merkez_kalite', 'sube_kalite']::text[]
  );

-- SİLME: Sadece Admin
CREATE POLICY "delete_users" ON users
  FOR DELETE USING (
    public.get_my_role() && ARRAY['admin']::text[]
  );

-- 4. Fonksiyona erişim izni ver
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
