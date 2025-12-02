-- Script to create initial users in Supabase
-- Bu script'i Supabase SQL Editor'de manuel olarak çalıştırmanız gerekiyor

-- NOT: Önce Supabase Dashboard'dan Authentication > Users bölümünden aşağıdaki kullanıcıları oluşturun:
-- 1. bekir.filizdag@anadoluhastaneleri.com - Şifre: 232123Sbb..
-- 2. bilgehan.batur@anadoluhastaneleri.com - Şifre: 232123Bbb..
-- 3. zuhal.aktas@anadoluhastaneleri.com - Şifre: 232123Zaa..
-- 4. fatma.yilmaz@anadoluhastaneleri.com - Şifre: 232123Fyy..

-- Sonra bu kullanıcıların UUID'lerini alın ve aşağıdaki INSERT statement'larında kullanın
-- UUID'leri almak için:
-- SELECT id, email FROM auth.users;

-- Örnek INSERT statements (UUID'leri gerçek değerlerle değiştirin):

-- INSERT INTO users (id, email, display_name, role, facility_id, department_id, department_name, is_active) VALUES
-- ('REPLACE-WITH-ACTUAL-UUID-1', 'bekir.filizdag@anadoluhastaneleri.com', 'Bekir Filizdağ', ARRAY['admin'], 1, NULL, 'Yönetim', true),
-- ('REPLACE-WITH-ACTUAL-UUID-2', 'bilge.batur@anadoluhastaneleri.com', 'Bilge Batur', ARRAY['sube_kalite'], 1, NULL, 'Kalite Yönetimi', true),
-- ('REPLACE-WITH-ACTUAL-UUID-3', 'zuhal.aktas@anadoluhastaneleri.com', 'Zuhal Aktaş', ARRAY['sube_kalite'], 3, NULL, 'Kalite Yönetimi', true),
-- ('REPLACE-WITH-ACTUAL-UUID-4', 'fatma.yilmaz@anadoluhastaneleri.com', 'Fatma Yılmaz', ARRAY['sube_kalite'], 2, NULL, 'Kalite Yönetimi', true);

-- Facilities kontrolü (varsa güncelleme yapabilirsiniz)
UPDATE facilities SET name = 'Anadolu Hastanesi Silivri' WHERE id = 1;

-- Eğer Avcılar şubesi yoksa ekleyin
INSERT INTO facilities (id, name, code, address, phone)
VALUES (2, 'Anadolu Hastanesi Avcılar', 'AVR', 'Avcılar, İstanbul', '+90 212 XXX XX XX')
ON CONFLICT (id) DO UPDATE SET name = 'Anadolu Hastanesi Avcılar';

-- Eğer Ereğli şubesi yoksa ekleyin
INSERT INTO facilities (id, name, code, address, phone)
VALUES (3, 'Anadolu Hastanesi Ereğli', 'ERG', 'Ereğli, Zonguldak', '+90 372 XXX XX XX')
ON CONFLICT (id) DO UPDATE SET name = 'Anadolu Hastanesi Ereğli';
