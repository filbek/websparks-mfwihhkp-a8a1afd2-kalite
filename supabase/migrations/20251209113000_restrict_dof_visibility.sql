/*
  # DÖF Görünürlük Kısıtlaması (RLS)
  
  ## Amaç
  Şubedeki normal personelin, kendi dahil olduğu (açtığı/atandığı) kayıtlar dışındaki DÖF'leri görmesini engellemek.
  Sadece Kalite Yöneticileri (Merkez/Şube) ve Adminler tüm kayıtları görebilmelidir.
  
  ## Değişiklikler
  1. Mevcut "Users can view DOFs in their facility or assigned to them" politikası KALDIRILACAK (Fazla izin veriyor).
  2. Mevcut "Dofs visibility restricted" politikası KALDIRILACAK (Yenisi ile birleştirilecek).
  3. Yeni "Strict DOF Visibility Policy" OLUŞTURULACAK.
  
  ## Yeni Kural Detayı
  - **Admin / Merkez Kalite:** Tüm kayıtları görür.
  - **Şube Kalite:** Sadece kendi şubesindeki kayıtları görür.
  - **Standart Kullanıcı:**
    - Raporlayan (reporter_id) ise görür.
    - DÖF'ü Açan (dofu_acan) ise görür.
    - Atanan (assigned_to) ise görür.
    - CC Listesinde (cc_users) ise görür.
*/

-- Mevcut geniş/hatalı politikaları temizle
DROP POLICY IF EXISTS "Users can view DOFs in their facility or assigned to them" ON dofs;
DROP POLICY IF EXISTS "Dofs visibility restricted" ON dofs;
DROP POLICY IF EXISTS "Users can read assigned or CC DOFs" ON dofs; -- Varsa bunu da temizleyelim

-- Yeni Sıkı Görünürlük Politikası
CREATE POLICY "Strict DOF Visibility Policy" ON dofs
FOR SELECT
TO authenticated
USING (
  -- 1. Admin ve Merkez Kalite her şeyi görür
  (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (
      'admin' = ANY(users.role) 
      OR 'merkez_kalite' = ANY(users.role)
    )
  ))
  OR
  -- 2. Şube Kalite sadece kendi şubesini görür
  (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND 'sube_kalite' = ANY(users.role) 
    AND users.facility_id = dofs.facility_id
  ))
  OR
  -- 3. İlişkili Kullanıcılar (Standart Personel)
  (
    reporter_id = auth.uid() 
    OR dofu_acan = auth.uid() 
    OR assigned_to = auth.uid() 
    OR auth.uid() = ANY(cc_users)
  )
);
