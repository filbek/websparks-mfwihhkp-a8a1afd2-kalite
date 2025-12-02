/*
  # DÖF Yönetim Sistemi Tabloları

  ## Yeni Tablolar
  1. `dof_kaynaklari` (DÖF Kaynakları)
     - `id` (uuid, primary key)
     - `value` (text, unique) - Kaynak değeri (kod)
     - `label` (text) - Kaynak etiketi (görünen ad)
     - `is_active` (boolean) - Aktif/pasif durumu
     - `display_order` (integer) - Sıralama
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. `dof_kategorileri` (DÖF Kategorileri)
     - `id` (uuid, primary key)
     - `value` (text, unique) - Kategori değeri (kod)
     - `label` (text) - Kategori etiketi
     - `is_active` (boolean)
     - `display_order` (integer)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. `dof_kisa_aciklamalar` (Kategori Bazlı Kısa Açıklamalar)
     - `id` (uuid, primary key)
     - `kategori_value` (text, foreign key to dof_kategorileri)
     - `value` (text) - Açıklama değeri (kod)
     - `label` (text) - Açıklama etiketi
     - `is_active` (boolean)
     - `display_order` (integer)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. `dof_sorumlu_bolumler` (DÖF Sorumlu Bölümler)
     - `id` (uuid, primary key)
     - `value` (text, unique)
     - `label` (text)
     - `is_active` (boolean)
     - `display_order` (integer)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  5. `dof_attachments` (DÖF Ekleri)
     - `id` (uuid, primary key)
     - `dof_id` (uuid, foreign key to dofs)
     - `file_name` (text)
     - `file_size` (bigint)
     - `file_type` (text)
     - `storage_path` (text)
     - `uploaded_by` (uuid, foreign key to users)
     - `created_at` (timestamptz)

  6. `dof_history` (DÖF Geçmişi)
     - `id` (uuid, primary key)
     - `dof_id` (uuid, foreign key to dofs)
     - `user_id` (uuid, foreign key to users)
     - `action` (text) - created, updated, assigned, closed, etc.
     - `old_value` (jsonb)
     - `new_value` (jsonb)
     - `comment` (text)
     - `created_at` (timestamptz)

  7. `task_assignments` (Görev Atamaları)
     - `id` (uuid, primary key)
     - `from_user_id` (uuid, foreign key to users)
     - `to_user_id` (uuid, foreign key to users)
     - `facility_id` (integer, foreign key to facilities)
     - `dof_ids` (uuid[])
     - `transfer_date` (timestamptz)
     - `notes` (text)
     - `status` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Mevcut Tablolara Eklenen Kolonlar
  1. `dofs` tablosuna eklenenler:
     - `tespit_tarihi` (date) - Tespit tarihi
     - `dof_kaynagi` (text) - DÖF kaynağı
     - `dof_kategorisi` (text) - DÖF kategorisi
     - `kisa_aciklama` (text) - Kısa açıklama
     - `sorumlu_bolum` (text) - Sorumlu bölüm
     - `dofu_acan` (uuid, foreign key to users) - DÖF'ü açan kullanıcı

  ## Güvenlik
  - Tüm tablolarda RLS etkinleştirildi
  - Rol bazlı erişim politikaları eklendi
  - Personel: Sadece kendi DÖF'lerini görebilir
  - Şube Kalite: Kendi şubesindeki tüm DÖF'leri görebilir
  - Merkez Kalite: Tüm DÖF'leri görebilir
  - Lookup tablolar (kaynaklar, kategoriler): Herkes okuyabilir
*/

-- DÖF Kaynakları Tablosu
CREATE TABLE IF NOT EXISTS dof_kaynaklari (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DÖF Kategorileri Tablosu
CREATE TABLE IF NOT EXISTS dof_kategorileri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DÖF Kısa Açıklamalar Tablosu
CREATE TABLE IF NOT EXISTS dof_kisa_aciklamalar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori_value text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_kategori FOREIGN KEY (kategori_value) REFERENCES dof_kategorileri(value) ON DELETE CASCADE,
  CONSTRAINT unique_kategori_value UNIQUE (kategori_value, value)
);

-- DÖF Sorumlu Bölümler Tablosu
CREATE TABLE IF NOT EXISTS dof_sorumlu_bolumler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DÖF Ekleri Tablosu
CREATE TABLE IF NOT EXISTS dof_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dof_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_dof FOREIGN KEY (dof_id) REFERENCES dofs(id) ON DELETE CASCADE,
  CONSTRAINT fk_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- DÖF Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS dof_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dof_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_dof FOREIGN KEY (dof_id) REFERENCES dofs(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Görev Atamaları Tablosu
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  facility_id integer NOT NULL,
  dof_ids uuid[],
  transfer_date timestamptz DEFAULT now(),
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- DOFs tablosuna yeni kolonlar ekleme
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'tespit_tarihi'
  ) THEN
    ALTER TABLE dofs ADD COLUMN tespit_tarihi date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'dof_kaynagi'
  ) THEN
    ALTER TABLE dofs ADD COLUMN dof_kaynagi text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'dof_kategorisi'
  ) THEN
    ALTER TABLE dofs ADD COLUMN dof_kategorisi text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'kisa_aciklama'
  ) THEN
    ALTER TABLE dofs ADD COLUMN kisa_aciklama text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'sorumlu_bolum'
  ) THEN
    ALTER TABLE dofs ADD COLUMN sorumlu_bolum text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'dofu_acan'
  ) THEN
    ALTER TABLE dofs ADD COLUMN dofu_acan uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- İndeksler oluşturma
CREATE INDEX IF NOT EXISTS idx_dof_kaynaklari_value ON dof_kaynaklari(value);
CREATE INDEX IF NOT EXISTS idx_dof_kaynaklari_active ON dof_kaynaklari(is_active);
CREATE INDEX IF NOT EXISTS idx_dof_kategorileri_value ON dof_kategorileri(value);
CREATE INDEX IF NOT EXISTS idx_dof_kategorileri_active ON dof_kategorileri(is_active);
CREATE INDEX IF NOT EXISTS idx_dof_kisa_aciklamalar_kategori ON dof_kisa_aciklamalar(kategori_value);
CREATE INDEX IF NOT EXISTS idx_dof_kisa_aciklamalar_active ON dof_kisa_aciklamalar(is_active);
CREATE INDEX IF NOT EXISTS idx_dof_sorumlu_bolumler_value ON dof_sorumlu_bolumler(value);
CREATE INDEX IF NOT EXISTS idx_dof_attachments_dof_id ON dof_attachments(dof_id);
CREATE INDEX IF NOT EXISTS idx_dof_history_dof_id ON dof_history(dof_id);
CREATE INDEX IF NOT EXISTS idx_dof_history_created_at ON dof_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_assignments_from_user ON task_assignments(from_user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_to_user ON task_assignments(to_user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_facility ON task_assignments(facility_id);
CREATE INDEX IF NOT EXISTS idx_dofs_tespit_tarihi ON dofs(tespit_tarihi);
CREATE INDEX IF NOT EXISTS idx_dofs_kategorisi ON dofs(dof_kategorisi);
CREATE INDEX IF NOT EXISTS idx_dofs_kaynagi ON dofs(dof_kaynagi);

-- RLS Politikaları

-- DÖF Kaynakları - Herkes okuyabilir
ALTER TABLE dof_kaynaklari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active dof kaynaklari"
  ON dof_kaynaklari FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage dof kaynaklari"
  ON dof_kaynaklari FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- DÖF Kategorileri - Herkes okuyabilir
ALTER TABLE dof_kategorileri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active dof kategorileri"
  ON dof_kategorileri FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage dof kategorileri"
  ON dof_kategorileri FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- DÖF Kısa Açıklamalar - Herkes okuyabilir
ALTER TABLE dof_kisa_aciklamalar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active kisa aciklamalar"
  ON dof_kisa_aciklamalar FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage kisa aciklamalar"
  ON dof_kisa_aciklamalar FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- DÖF Sorumlu Bölümler - Herkes okuyabilir
ALTER TABLE dof_sorumlu_bolumler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sorumlu bolumler"
  ON dof_sorumlu_bolumler FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage sorumlu bolumler"
  ON dof_sorumlu_bolumler FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'admin' = ANY(users.role)
    )
  );

-- DÖF Ekleri - Rol bazlı erişim
ALTER TABLE dof_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read attachments of their DOFs"
  ON dof_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dofs
      WHERE dofs.id = dof_attachments.dof_id
      AND (
        dofs.reporter_id = auth.uid()
        OR dofs.assigned_to = auth.uid()
        OR dofs.dofu_acan = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'merkez_kalite' = ANY(users.role)
        )
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'sube_kalite' = ANY(users.role)
          AND dofs.facility_id = users.facility_id
        )
      )
    )
  );

CREATE POLICY "Users can upload attachments to their DOFs"
  ON dof_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM dofs
      WHERE dofs.id = dof_attachments.dof_id
      AND (
        dofs.reporter_id = auth.uid()
        OR dofs.assigned_to = auth.uid()
        OR dofs.dofu_acan = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own attachments"
  ON dof_attachments FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- DÖF Geçmişi - Rol bazlı erişim
ALTER TABLE dof_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read history of their DOFs"
  ON dof_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dofs
      WHERE dofs.id = dof_history.dof_id
      AND (
        dofs.reporter_id = auth.uid()
        OR dofs.assigned_to = auth.uid()
        OR dofs.dofu_acan = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'merkez_kalite' = ANY(users.role)
        )
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'sube_kalite' = ANY(users.role)
          AND dofs.facility_id = users.facility_id
        )
      )
    )
  );

CREATE POLICY "System can create history records"
  ON dof_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Görev Atamaları - Rol bazlı erişim
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their assignments"
  ON task_assignments FOR SELECT
  TO authenticated
  USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'merkez_kalite' = ANY(users.role)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'sube_kalite' = ANY(users.role)
      AND task_assignments.facility_id = users.facility_id
    )
  );

CREATE POLICY "Kalite users can create assignments"
  ON task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND ('merkez_kalite' = ANY(users.role) OR 'sube_kalite' = ANY(users.role))
    )
  );

CREATE POLICY "Kalite users can update assignments"
  ON task_assignments FOR UPDATE
  TO authenticated
  USING (
    from_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'merkez_kalite' = ANY(users.role)
    )
  )
  WITH CHECK (
    from_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND 'merkez_kalite' = ANY(users.role)
    )
  );

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dof_kaynaklari_updated_at
  BEFORE UPDATE ON dof_kaynaklari
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dof_kategorileri_updated_at
  BEFORE UPDATE ON dof_kategorileri
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dof_kisa_aciklamalar_updated_at
  BEFORE UPDATE ON dof_kisa_aciklamalar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dof_sorumlu_bolumler_updated_at
  BEFORE UPDATE ON dof_sorumlu_bolumler
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_assignments_updated_at
  BEFORE UPDATE ON task_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();