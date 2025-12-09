/*
  # DÖF RLS Policy Güncellemesi
  
  ## Sorun
  Mevcut "Users can update DOFs based on role and status" politikası, "taslak" veya "reddedildi" dışındaki durumlarda (örn. "çözüm_bekleyen") raporlayan kişinin (reporter) veya atanan kişinin satırı güncellemesini engelliyor.
  Bu nedenle raporlayan kişi DÖF'ü kapatmaya çalıştığında RLS hatası alıyor veya işlem sessizce başarısız oluyor.
  
  ## Çözüm
  Update politikasını genişleterek, raporlayan ve atanan kişilerin aktif DÖF'leri güncellemelerine izin veriyoruz.
  İstenmeyen değişiklikler (örn. atanan kişinin kapatması) zaten mevcut triggerlar (check_dof_closure_permission, prevent_assigned_user_status_change) tarafından engellenmektedir.
*/

-- Eski policy'i kaldır
DROP POLICY IF EXISTS "Users can update DOFs based on role and status" ON dofs;

-- Yeni policy oluştur
CREATE POLICY "Users can update DOFs based on role and status" ON dofs
FOR UPDATE
TO authenticated
USING (
  -- Kapatılmış veya iptal edilmiş DÖF'ler güncellenemez
  status NOT IN ('kapatıldı', 'iptal')
  AND (
    -- Admin, Merkez Kalite ve İlgili Şube Kalite yöneticileri her zaman güncelleyebilir
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        'admin' = ANY(users.role) 
        OR 'merkez_kalite' = ANY(users.role) 
        OR ('sube_kalite' = ANY(users.role) AND users.facility_id = dofs.facility_id)
      )
    )
    OR
    -- Raporlayan kişi, DÖF'ü açan kişi ve Atanan kişi güncelleyebilir
    -- (Kısıtlamalar triggerlar ile sağlanır)
    reporter_id = auth.uid() 
    OR dofu_acan = auth.uid()
    OR assigned_to = auth.uid()
  )
)
WITH CHECK (
  -- Yeni durum kontrolü triggerlar ile yapılır, burada genel bir engel koymuyoruz
  -- Ancak yine kapatılmış/iptal edilmiş bir kaydın üzerinde işlem yapılıyorsa (bu update ile o duruma gelmiyorsa) yukarıdaki USING engeller.
  -- Update sonucunda oluşan satır için ekstra bir kısıtlama koymuyoruz (status validasyonu triggerda).
  true
);
