-- event_type, status ve severity constraint'lerini kaldır
-- Çünkü yeni form farklı değerler kullanıyor

-- event_type constraint'ini kaldır
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- status constraint'ini kaldır  
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- severity constraint'ini kaldır
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_severity_check;