/*
  # Kapsamlı Bildirim Sistemi
  
  ## Amaç
  Kullanıcılara atanan her işlem (DÖF, Olay, Kanban) sonrası bildirim gösterilmesi
  
  ## Yeni Tablolar
  1. `notifications` - Tüm bildirimler için merkezi tablo
  
  ## Trigger Fonksiyonları
  1. `create_dof_assignment_notification()` - DÖF atamaları için
  2. `create_event_assignment_notification()` - Olay bildirimleri için
  3. `create_kanban_assignment_notification()` - Kanban kartları için
*/

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_type text,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- 1. DÖF Atamaları için Trigger
CREATE OR REPLACE FUNCTION create_dof_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Assigned user için bildirim (yeni atama veya atama değişikliği)
  IF NEW.assigned_to IS NOT NULL AND (OLD IS NULL OR OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      NEW.assigned_to,
      'dof_assignment',
      'Yeni DÖF Ataması',
      'Size yeni bir DÖF atandı: ' || COALESCE(NEW.title, 'Başlıksız DÖF'),
      'dof',
      NEW.id
    );
  END IF;
  
  -- CC users için bildirimler (yeni CC eklendiğinde)
  IF NEW.cc_users IS NOT NULL AND array_length(NEW.cc_users, 1) > 0 THEN
    DECLARE
      new_cc_user uuid;
    BEGIN
      FOREACH new_cc_user IN ARRAY NEW.cc_users
      LOOP
        -- Eğer bu kullanıcı önceden CC listesinde değilse bildirim oluştur
        IF OLD IS NULL OR OLD.cc_users IS NULL OR NOT (new_cc_user = ANY(OLD.cc_users)) THEN
          INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
          VALUES (
            new_cc_user,
            'dof_cc',
            'DÖF Bilgilendirme',
            'Bir DÖF''te bilgilendirildiniz: ' || COALESCE(NEW.title, 'Başlıksız DÖF'),
            'dof',
            NEW.id
          );
        END IF;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dof_assignment_notification ON dofs;
CREATE TRIGGER trigger_dof_assignment_notification
  AFTER INSERT OR UPDATE OF assigned_to, cc_users ON dofs
  FOR EACH ROW
  EXECUTE FUNCTION create_dof_assignment_notification();

-- 2. Olay Bildirimleri için Trigger
CREATE OR REPLACE FUNCTION create_event_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Assigned user için bildirim
  IF NEW.assigned_to IS NOT NULL AND (OLD IS NULL OR OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      NEW.assigned_to::uuid,
      'event_assignment',
      'Yeni Olay Ataması',
      'Size yeni bir olay bildirimi atandı',
      'event',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_event_assignment_notification ON events;
CREATE TRIGGER trigger_event_assignment_notification
  AFTER INSERT OR UPDATE OF assigned_to ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_event_assignment_notification();

-- 3. Kanban Kartları için Trigger
CREATE OR REPLACE FUNCTION create_kanban_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Assigned user için bildirim
  IF NEW.assigned_to IS NOT NULL AND (OLD IS NULL OR OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      NEW.assigned_to,
      'kanban_assignment',
      'Yeni Görev Ataması',
      'Size yeni bir görev atandı: ' || NEW.title,
      'kanban_card',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_kanban_assignment_notification ON cards;
CREATE TRIGGER trigger_kanban_assignment_notification
  AFTER INSERT OR UPDATE OF assigned_to ON cards
  FOR EACH ROW
  EXECUTE FUNCTION create_kanban_assignment_notification();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notifications IS 'Tüm modüller için merkezi bildirim tablosu';
COMMENT ON COLUMN notifications.type IS 'Bildirim türü: dof_assignment, event_assignment, kanban_assignment, dof_cc, status_change';
COMMENT ON COLUMN notifications.related_type IS 'İlgili kaydın türü: dof, event, kanban_card';
COMMENT ON COLUMN notifications.related_id IS 'İlgili kaydın ID''si';
