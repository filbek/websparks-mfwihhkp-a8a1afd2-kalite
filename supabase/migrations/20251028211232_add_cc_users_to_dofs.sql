/*
  # DÖF Tablosuna Bilgi Verilecek Kişiler (CC Users) Alanı Ekleme

  ## Açıklama
  DÖF atama işleminde, ana atanan kullanıcıya ek olarak bilgi verilecek 
  (carbon copy - CC) kullanıcılar için yeni bir alan eklenir.

  ## Değişiklikler
  1. `dofs` tablosuna yeni kolon ekleme
     - `cc_users` (uuid[]) - Bilgi verilecek kullanıcıların ID dizisi
     - NULL olabilir, opsiyonel bir alandır
     - Array tipinde olduğu için birden fazla kullanıcı seçilebilir

  ## RLS Politikaları
  - CC listesindeki kullanıcılar da DÖF'ü görüntüleyebilmelidir
  - Mevcut "Users can read assigned DOFs" politikası güncellenecek

  ## Notlar
  - CC kullanıcılar DÖF'ü görüntüleyebilir ama sorumlu değildir
  - Ana sorumlu hala `assigned_to` alanındaki kullanıcıdır
  - CC kullanıcılar yorum yapabilir ama durum değiştiremez
*/

-- DÖFs tablosuna cc_users kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'cc_users'
  ) THEN
    ALTER TABLE dofs ADD COLUMN cc_users uuid[];
  END IF;
END $$;

-- CC kullanıcıların DÖF'leri görüntüleyebilmesi için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_dofs_cc_users ON dofs USING GIN (cc_users);

-- Mevcut "Users can read assigned DOFs" politikasını kaldır ve yeniden oluştur
DROP POLICY IF EXISTS "Users can read assigned DOFs" ON dofs;

-- Kullanıcılar kendilerine atanan veya CC olarak eklendikleri DÖF'leri okuyabilir
CREATE POLICY "Users can read assigned or CC DOFs"
  ON dofs FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    auth.uid() = ANY(cc_users) OR
    reporter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        'admin' = ANY(users.role) OR
        'merkez_kalite' = ANY(users.role) OR
        (
          'sube_kalite' = ANY(users.role) AND
          users.facility_id = dofs.facility_id
        )
      )
    )
  );

-- Yorum: CC kullanıcılar için bildirim sistemi gerekirse gelecekte eklenebilir
COMMENT ON COLUMN dofs.cc_users IS 'Bilgi verilecek (CC) kullanıcıların ID dizisi - opsiyonel';
