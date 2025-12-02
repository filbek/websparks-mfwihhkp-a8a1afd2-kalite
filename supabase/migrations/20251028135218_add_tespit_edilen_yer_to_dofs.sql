/*
  # DÖF Tablosuna Tespit Edilen Yer/Bölüm Kolonu Ekleme

  ## Açıklama
  Bu migration, dofs tablosuna tespit_edilen_yer kolonu ekler.
  Bu kolon, dof_locations tablosundaki value değerlerini referans alır.

  ## Değişiklikler
  1. `dofs` tablosuna yeni kolon eklendi:
     - `tespit_edilen_yer` (text, nullable) - DÖF'ün tespit edildiği yer/bölüm
     
  2. Index oluşturuldu:
     - Performans için tespit_edilen_yer kolonuna index eklendi

  ## Notlar
  - Bu kolon dof_locations tablosundaki value değerlerini tutar
  - Nullable çünkü eski kayıtlarda bu bilgi olmayabilir
  - Foreign key constraint eklenmedi çünkü bölümler silindiğinde DÖF kayıtları korunmalı
*/

-- Tespit edilen yer kolonu ekleme
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'tespit_edilen_yer'
  ) THEN
    ALTER TABLE dofs ADD COLUMN tespit_edilen_yer text;
  END IF;
END $$;

-- Index oluşturma
CREATE INDEX IF NOT EXISTS idx_dofs_tespit_edilen_yer ON dofs(tespit_edilen_yer);

-- Mevcut kayıtları güncelleme (opsiyonel - eğer facility_id'den mapping yapmak istersek)
-- Bu kısım şimdilik yorum satırında, çünkü eski facility_id değerlerinin 
-- yeni location value'lara nasıl map edileceğini bilmiyoruz
