-- DIAGNOSTIC SCRIPT
-- Bu scripti Supabase SQL Editor'de çalıştırarak verilerinizin durumunu kontrol edebilirsiniz.
-- Çıktıyı "Messages" veya "Results" sekmesinde görebilirsiniz.

DO $$
DECLARE
  default_org_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
  
  -- Sayım değişkenleri
  user_count INT;
  user_in_org_count INT;
  
  board_count INT;
  board_in_org_count INT;
  board_null_org_count INT;
  
  card_count INT;
  card_in_org_count INT;
BEGIN
  -- 1. Kullanıcı Kontrolü
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO user_in_org_count FROM users WHERE organization_id = default_org_id;
  
  RAISE NOTICE '------------------------------------------------';
  RAISE NOTICE 'KULLANICI DURUMU:';
  RAISE NOTICE 'Toplam Kullanıcı: %', user_count;
  RAISE NOTICE 'Default Org''a Bağlı Kullanıcı: %', user_in_org_count;
  
  IF user_count > 0 AND user_in_org_count = 0 THEN
    RAISE WARNING 'DİKKAT: Kullanıcılarınızın hiçbiri Default Organization''a bağlı değil!';
  END IF;

  -- 2. Pano (Board) Kontrolü
  SELECT COUNT(*) INTO board_count FROM boards;
  SELECT COUNT(*) INTO board_in_org_count FROM boards WHERE organization_id = default_org_id;
  SELECT COUNT(*) INTO board_null_org_count FROM boards WHERE organization_id IS NULL;
  
  RAISE NOTICE '------------------------------------------------';
  RAISE NOTICE 'PANO (BOARD) DURUMU:';
  RAISE NOTICE 'Toplam Pano: %', board_count;
  RAISE NOTICE 'Default Org''a Bağlı Pano: %', board_in_org_count;
  RAISE NOTICE 'Organization ID''si NULL Olan Pano: %', board_null_org_count;
  
  IF board_count > 0 AND board_in_org_count = 0 THEN
    RAISE WARNING 'DİKKAT: Panolarınızın hiçbiri Default Organization''a bağlı değil!';
  END IF;

  -- 3. Kart (Card) Kontrolü
  SELECT COUNT(*) INTO card_count FROM cards;
  SELECT COUNT(*) INTO card_in_org_count FROM cards WHERE organization_id = default_org_id;
  
  RAISE NOTICE '------------------------------------------------';
  RAISE NOTICE 'KART (CARD) DURUMU:';
  RAISE NOTICE 'Toplam Kart: %', card_count;
  RAISE NOTICE 'Default Org''a Bağlı Kart: %', card_in_org_count;

  RAISE NOTICE '------------------------------------------------';
  RAISE NOTICE 'ÖNERİ:';
  IF user_in_org_count < user_count OR board_in_org_count < board_count THEN
    RAISE NOTICE 'Lütfen "FIX-data-visibility.sql" scriptini çalıştırın.';
  ELSE
    RAISE NOTICE 'Veriler doğru görünüyor. Sorun RLS politikalarında veya API çağrısında olabilir.';
  END IF;
END $$;
