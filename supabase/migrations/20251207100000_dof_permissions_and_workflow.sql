/*
  # DÖF Yetki Kısıtlamaları ve Onay İş Akışı
  
  ## Değişiklikler
  1. Atama yetkisi kısıtlaması - Atanan kişi başkasına atayamaz
  2. Kapatma yetkisi kısıtlaması - Sadece açan ve kalite yöneticileri kapatabilir
  3. Durum değiştirme kısıtlaması - Atanan kişi durum değiştiremez
  4. Yeni durum: kapatma_onayinda
  5. Onay bildirimleri için trigger
*/

-- ============================================================================
-- YENİ DURUM EKLE
-- ============================================================================

-- Mevcut durumlar: atanmayı_bekleyen, atanan, devam_ediyor, tamamlandı, kapatıldı, iptal
-- Yeni durum: kapatma_onayinda

-- Not: Eğer status enum kullanılıyorsa güncellenmeli, text ise eklemeye gerek yok

-- ============================================================================
-- NOTIFICATION TYPE GÜNCELLEME
-- ============================================================================

-- Notification type'a yeni tip ekle
COMMENT ON COLUMN notifications.type IS 'Bildirim türü: dof_assignment, dof_cc, event_assignment, kanban_assignment, dof_approval_required, status_change';

-- ============================================================================
-- KAPATMA ONAYI BİLDİRİMİ TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION create_dof_approval_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Durum "kapatma_onayinda" olduğunda
  IF NEW.status = 'kapatma_onayinda' AND (OLD.status IS NULL OR OLD.status != 'kapatma_onayinda') THEN
    
    -- Atayan kişiye bildirim (dofu_acan veya reporter_id)
    IF NEW.dofu_acan IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
      VALUES (
        NEW.dofu_acan,
        'dof_approval_required',
        'DÖF Kapatma Onayı Bekliyor',
        'Atadığınız DÖF yanıtlandı ve kapatma onayınızı bekliyor: ' || COALESCE(NEW.title, 'Başlıksız DÖF'),
        'dof',
        NEW.id
      );
    ELSIF NEW.reporter_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
      VALUES (
        NEW.reporter_id,
        'dof_approval_required',
        'DÖF Kapatma Onayı Bekliyor',
        'Açtığınız DÖF yanıtlandı ve kapatma onayınızı bekliyor: ' || COALESCE(NEW.title, 'Başlıksız DÖF'),
        'dof',
        NEW.id
      );
    END IF;
    
    -- Kalite yöneticilerine bildirim
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    SELECT 
      u.id,
      'dof_approval_required',
      'DÖF Kapatma Onayı Bekliyor',
      'Bir DÖF yanıtlandı ve kapatma onayı bekliyor: ' || COALESCE(NEW.title, 'Başlıksız DÖF'),
      'dof',
      NEW.id
    FROM users u
    WHERE 'sube_kalite' = ANY(u.role) OR 'merkez_kalite' = ANY(u.role);
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dof_approval_notification ON dofs;
CREATE TRIGGER trigger_dof_approval_notification
  AFTER UPDATE OF status ON dofs
  FOR EACH ROW
  EXECUTE FUNCTION create_dof_approval_notification();

-- ============================================================================
-- RLS POLICY GÜNCELLEMELERİ
-- ============================================================================

-- NOT: RLS Policy'lerde NEW ve OLD kullanılamaz!
-- Policy'ler sadece mevcut satırı (current row) kontrol edebilir
-- Durum değişikliği kontrolü için trigger kullanmalıyız

-- Mevcut policy'leri kaldır (eğer varsa)
DROP POLICY IF EXISTS "Assigned user cannot change status" ON dofs;
DROP POLICY IF EXISTS "Restrict DOF closure" ON dofs;
DROP POLICY IF EXISTS "Restrict DOF assignment" ON dofs;

-- ============================================================================
-- DURUM DEĞİŞİKLİĞİ KONTROLÜ İÇİN TRIGGER
-- ============================================================================

-- Atanan kişinin durum değiştirmesini engelleyen trigger
CREATE OR REPLACE FUNCTION prevent_assigned_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer atanan kişi durum değiştirmeye çalışıyorsa
  IF OLD.assigned_to = auth.uid() AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Atanan kişi DÖF durumunu değiştiremez. Lütfen yorum ekleyerek yanıt gönderin.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_assigned_status_change ON dofs;
CREATE TRIGGER trigger_prevent_assigned_status_change
  BEFORE UPDATE OF status ON dofs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_assigned_user_status_change();

-- ============================================================================
-- KAPATMA YETKİSİ KONTROLÜ İÇİN TRIGGER
-- ============================================================================

-- Sadece yetkili kişilerin kapatmasını sağlayan trigger
CREATE OR REPLACE FUNCTION check_dof_closure_permission()
RETURNS TRIGGER AS $$
DECLARE
  user_roles text[];
  is_quality_manager boolean;
BEGIN
  -- Eğer kapatılıyorsa veya iptal ediliyorsa
  IF (NEW.status = 'kapatıldı' OR NEW.status = 'iptal') AND 
     (OLD.status != 'kapatıldı' AND OLD.status != 'iptal') THEN
    
    -- Kullanıcının rollerini al
    SELECT role INTO user_roles FROM users WHERE id = auth.uid();
    
    -- Kalite yöneticisi mi kontrol et
    is_quality_manager := 'sube_kalite' = ANY(user_roles) OR 'merkez_kalite' = ANY(user_roles);
    
    -- Yetki kontrolü
    IF NOT (NEW.dofu_acan = auth.uid() OR 
            NEW.reporter_id = auth.uid() OR 
            is_quality_manager) THEN
      RAISE EXCEPTION 'DÖF''ü sadece açan kişi veya kalite yöneticileri kapatabilir.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_closure_permission ON dofs;
CREATE TRIGGER trigger_check_closure_permission
  BEFORE UPDATE OF status ON dofs
  FOR EACH ROW
  EXECUTE FUNCTION check_dof_closure_permission();

-- ============================================================================
-- ATAMA YETKİSİ KONTROLÜ İÇİN TRIGGER
-- ============================================================================

-- Atanan kişinin başkasına atayamamasını sağlayan trigger
CREATE OR REPLACE FUNCTION check_dof_assignment_permission()
RETURNS TRIGGER AS $$
DECLARE
  user_roles text[];
  is_quality_manager boolean;
BEGIN
  -- Eğer assigned_to değişiyorsa
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    
    -- Kullanıcının rollerini al
    SELECT role INTO user_roles FROM users WHERE id = auth.uid();
    
    -- Kalite yöneticisi mi kontrol et
    is_quality_manager := 'sube_kalite' = ANY(user_roles) OR 'merkez_kalite' = ANY(user_roles);
    
    -- Eğer atanan kişi ise ve yetkili değilse
    IF OLD.assigned_to = auth.uid() AND 
       NOT (NEW.dofu_acan = auth.uid() OR 
            NEW.reporter_id = auth.uid() OR 
            is_quality_manager) THEN
      RAISE EXCEPTION 'Atanan kişi DÖF''ü başkasına atayamaz.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_assignment_permission ON dofs;
CREATE TRIGGER trigger_check_assignment_permission
  BEFORE UPDATE OF assigned_to ON dofs
  FOR EACH ROW
  EXECUTE FUNCTION check_dof_assignment_permission();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION create_dof_approval_notification() IS 'DÖF kapatma onayı beklendiğinde atayan ve kalite yöneticilerine bildirim gönderir';
COMMENT ON FUNCTION prevent_assigned_user_status_change() IS 'Atanan kişinin DÖF durumunu değiştirmesini engeller';
COMMENT ON FUNCTION check_dof_closure_permission() IS 'DÖF kapatma yetkisini kontrol eder';
COMMENT ON FUNCTION check_dof_assignment_permission() IS 'DÖF atama yetkisini kontrol eder';

COMMENT ON TRIGGER trigger_dof_approval_notification ON dofs IS 'DÖF durumu kapatma_onayinda olduğunda bildirim oluşturur';
COMMENT ON TRIGGER trigger_prevent_assigned_status_change ON dofs IS 'Atanan kişinin durum değiştirmesini engeller';
COMMENT ON TRIGGER trigger_check_closure_permission ON dofs IS 'Kapatma yetkisini kontrol eder';
COMMENT ON TRIGGER trigger_check_assignment_permission ON dofs IS 'Atama yetkisini kontrol eder';
