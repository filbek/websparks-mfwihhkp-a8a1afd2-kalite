/*
  # HSS Kodu Alanı Ekleme

  ## Açıklama
  Hasta Güvenliği Olay Bildirimi formuna HSS kodu girilmesini sağlamak için
  events tablosuna hss_code alanı eklenir.

  ## Değişiklikler
  1. Yeni Alan
    - `hss_code` (text): Kullanıcının manuel olarak gireceği HSS kodu
      - Format örneği: HPL.HM.Z1.0
      - Opsiyonel alan (NULL olabilir)

  2. İndeks
    - hss_code alanı için indeks oluşturulur (arama performansı için)

  ## Güvenlik
  - Mevcut RLS politikaları geçerli olacaktır
  - Yeni alan için ek politika gerekmez
*/

-- events tablosuna hss_code alanını ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'hss_code'
  ) THEN
    ALTER TABLE events ADD COLUMN hss_code text;
  END IF;
END $$;

-- hss_code alanı için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_events_hss_code ON events(hss_code);

-- hss_code alanına yorum ekle
COMMENT ON COLUMN events.hss_code IS 'Hasta Güvenliği Standardı kodu - Manuel olarak girilir (Format: HPL.HM.Z1.0)';
