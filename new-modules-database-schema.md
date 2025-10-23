# Yeni Modüller Veritabanı Şeması

## 1. Görüş-Öneri Sistemi Tabloları

### feedback_categories
```sql
CREATE TABLE feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### feedback_suggestions
```sql
CREATE TABLE feedback_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES feedback_categories(id),
  reporter_id UUID REFERENCES users(id),
  reporter_name VARCHAR(255), -- Anonim kullanıcılar için
  reporter_email VARCHAR(255), -- Anonim kullanıcılar için
  reporter_phone VARCHAR(20), -- Anonim kullanıcılar için
  priority VARCHAR(20) DEFAULT 'orta' CHECK (priority IN ('düşük', 'orta', 'yüksek', 'kritik')),
  status VARCHAR(20) DEFAULT 'yeni' CHECK (status IN ('yeni', 'inceleniyor', 'beklemede', 'cozuldu', 'kapatildi')),
  is_anonymous BOOLEAN DEFAULT false,
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER,
  tags TEXT[], -- Etiketler için array
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### feedback_responses
```sql
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id),
  response TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Sadece iç görünürlük
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### feedback_votes
```sql
CREATE TABLE feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);
```

## 2. Şikayet Yönetimi CRM Tabloları

### complaint_categories
```sql
CREATE TABLE complaint_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES complaint_categories(id),
  sla_hours INTEGER DEFAULT 48, -- Service Level Agreement
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### complaints
```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number VARCHAR(50) UNIQUE NOT NULL, -- Otomatik oluşturulan numara
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES complaint_categories(id),
  subcategory_id UUID REFERENCES complaint_categories(id),
  
  -- Müşteri bilgileri
  complainant_name VARCHAR(255) NOT NULL,
  complainant_email VARCHAR(255),
  complainant_phone VARCHAR(20),
  complainant_type VARCHAR(20) DEFAULT 'hasta' CHECK (complainant_type IN ('hasta', 'hasta_yakini', 'personel', 'diger')),
  
  -- Şikayet detayları
  priority VARCHAR(20) DEFAULT 'orta' CHECK (priority IN ('düşük', 'orta', 'yüksek', 'kritik', 'acil')),
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('dusuk', 'normal', 'yuksek', 'acil')),
  status VARCHAR(20) DEFAULT 'yeni' CHECK (status IN ('yeni', 'atanmayi_bekleyen', 'inceleniyor', 'cozum_surecinde', 'cozuldu', 'kapatildi', 'iptal')),
  
  -- Atama bilgileri
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Zaman bilgileri
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Konum ve bağlam
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER,
  location VARCHAR(255),
  
  -- Ek bilgiler
  tags TEXT[],
  attachments TEXT[], -- Dosya yolları array'i
  
  -- Müşteri memnuniyeti
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_comment TEXT,
  
  reporter_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### complaint_assignments
```sql
CREATE TABLE complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'pasif', 'iptal')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE
);
```

### complaint_responses
```sql
CREATE TABLE complaint_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id),
  response TEXT NOT NULL,
  response_type VARCHAR(20) DEFAULT 'not' CHECK (response_type IN ('not', 'email', 'telefon', 'yuz_yuze')),
  is_internal BOOLEAN DEFAULT false,
  is_customer_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### complaint_satisfaction_surveys
```sql
CREATE TABLE complaint_satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  survey_sent_at TIMESTAMP WITH TIME ZONE,
  survey_completed_at TIMESTAMP WITH TIME ZONE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  resolution_time_rating INTEGER CHECK (resolution_time_rating >= 1 AND resolution_time_rating <= 5),
  staff_attitude_rating INTEGER CHECK (staff_attitude_rating >= 1 AND staff_attitude_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  additional_comments TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Eğitim Yönetim Sistemi Tabloları

### training_categories
```sql
CREATE TABLE training_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_programs
```sql
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES training_categories(id),
  training_type VARCHAR(20) DEFAULT 'online' CHECK (training_type IN ('online', 'yuz_yuze', 'hibrit')),
  duration_hours INTEGER,
  max_participants INTEGER,
  min_participants INTEGER DEFAULT 1,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  prerequisites TEXT[], -- Ön koşullar
  learning_objectives TEXT[],
  
  -- Sertifika bilgileri
  provides_certificate BOOLEAN DEFAULT false,
  certificate_template TEXT,
  passing_score INTEGER DEFAULT 70,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_sessions
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Zaman bilgileri
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Lokasyon bilgileri
  location VARCHAR(255),
  online_meeting_url TEXT,
  meeting_room VARCHAR(100),
  
  -- Eğitmen bilgileri
  instructor_id UUID REFERENCES users(id),
  assistant_instructors UUID[] REFERENCES users(id),
  
  -- Katılım bilgileri
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  
  -- Durum
  status VARCHAR(20) DEFAULT 'planlandi' CHECK (status IN ('planlandi', 'kayit_acik', 'dolu', 'basladi', 'tamamlandi', 'iptal')),
  
  facility_id INTEGER REFERENCES facilities(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_participants
```sql
CREATE TABLE training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id),
  
  -- Kayıt bilgileri
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registered_by UUID REFERENCES users(id),
  
  -- Katılım bilgileri
  attendance_status VARCHAR(20) DEFAULT 'kayitli' CHECK (attendance_status IN ('kayitli', 'katildi', 'katilmadi', 'iptal')),
  attended_at TIMESTAMP WITH TIME ZONE,
  
  -- Değerlendirme bilgileri
  completion_status VARCHAR(20) DEFAULT 'baslamadi' CHECK (completion_status IN ('baslamadi', 'devam_ediyor', 'tamamlandi', 'basarisiz')),
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  
  -- Sertifika bilgileri
  certificate_issued BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  
  -- Geri bildirim
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);
```

### training_materials
```sql
CREATE TABLE training_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  material_type VARCHAR(20) CHECK (material_type IN ('document', 'video', 'presentation', 'link', 'quiz')),
  file_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(100),
  external_url TEXT,
  
  order_index INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_quizzes
```sql
CREATE TABLE training_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  passing_score INTEGER DEFAULT 70,
  shuffle_questions BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_quiz_questions
```sql
CREATE TABLE training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES training_quizzes(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  options JSONB, -- Çok seçenekli sorular için seçenekler
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### training_quiz_attempts
```sql
CREATE TABLE training_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES training_quizzes(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id),
  
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  
  answers JSONB, -- Kullanıcı cevapları
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Ortak Tablolar ve İndeksler

### İndeksler
```sql
-- Feedback için indeksler
CREATE INDEX idx_feedback_suggestions_category_id ON feedback_suggestions(category_id);
CREATE INDEX idx_feedback_suggestions_status ON feedback_suggestions(status);
CREATE INDEX idx_feedback_suggestions_priority ON feedback_suggestions(priority);
CREATE INDEX idx_feedback_suggestions_created_at ON feedback_suggestions(created_at);
CREATE INDEX idx_feedback_suggestions_facility_id ON feedback_suggestions(facility_id);

-- Complaints için indeksler
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_facility_id ON complaints(facility_id);

-- Training için indeksler
CREATE INDEX idx_training_sessions_program_id ON training_sessions(program_id);
CREATE INDEX idx_training_sessions_start_date ON training_sessions(start_date);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);
CREATE INDEX idx_training_participants_session_id ON training_participants(session_id);
CREATE INDEX idx_training_participants_participant_id ON training_participants(participant_id);
```

### Trigger'lar ve Fonksiyonlar
```sql
-- Updated_at kolonu için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'ları
CREATE TRIGGER update_feedback_suggestions_updated_at 
    BEFORE UPDATE ON feedback_suggestions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at 
    BEFORE UPDATE ON training_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Şikayet numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.complaint_number := 'SK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_complaint_number_trigger
    BEFORE INSERT ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION generate_complaint_number();
```

## 5. Row Level Security (RLS) Politikaları

### Feedback için RLS
```sql
ALTER TABLE feedback_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Personel sadece kendi şubesindeki feedbackleri görebilir
CREATE POLICY "Personel can view facility feedback" ON feedback_suggestions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') = 'personel' AND
        facility_id = current_setting('app.current_user_facility_id')::integer
    );

-- Şube kalite kendi şubesindeki feedbackleri yönetebilir
CREATE POLICY "Branch quality can manage facility feedback" ON feedback_suggestions
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') = 'sube_kalite' AND
        facility_id = current_setting('app.current_user_facility_id')::integer
    );

-- Merkez kalite ve admin tüm feedbackleri yönetebilir
CREATE POLICY "Admin and center quality can manage all feedback" ON feedback_suggestions
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') IN ('merkez_kalite', 'admin')
    );
```

### Complaints için RLS
```sql
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;

-- Personel sadece kendi atandığı şikayetleri görebilir
CREATE POLICY "Personel can view assigned complaints" ON complaints
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') = 'personel' AND
        assigned_to = current_setting('app.current_user_id')
    );

-- Şube kalite kendi şubesindeki şikayetleri yönetebilir
CREATE POLICY "Branch quality can manage facility complaints" ON complaints
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') = 'sube_kalite' AND
        facility_id = current_setting('app.current_user_facility_id')::integer
    );

-- Merkez kalite ve admin tüm şikayetleri yönetebilir
CREATE POLICY "Admin and center quality can manage all complaints" ON complaints
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') IN ('merkez_kalite', 'admin')
    );
```

### Training için RLS
```sql
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;

-- Personel tüm eğitimleri görebilir, kendi katılımlarını yönetebilir
CREATE POLICY "Personel can view all training" ON training_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Personel can manage own participation" ON training_participants
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        participant_id = current_setting('app.current_user_id')
    );

-- Şube kalite kendi şubesindeki eğitimleri yönetebilir
CREATE POLICY "Branch quality can manage facility training" ON training_sessions
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') = 'sube_kalite' AND
        facility_id = current_setting('app.current_user_facility_id')::integer
    );

-- Merkez kalite ve admin tüm eğitimleri yönetebilir
CREATE POLICY "Admin and center quality can manage all training" ON training_sessions
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        current_setting('app.current_user_role') IN ('merkez_kalite', 'admin')
    );
```

## 6. Varsayılan Veriler

### Feedback Kategorileri
```sql
INSERT INTO feedback_categories (name, description, icon, color) VALUES
('Hizmet Kalitesi', 'Hizmet kalitesi ile ilgili görüşler', 'bi-star', '#3B82F6'),
('Personel', 'Personel ile ilgili görüşler', 'bi-people', '#10B981'),
('Fiziksel Ortam', 'Hastane fiziksel ortamı', 'bi-building', '#F59E0B'),
('Teknoloji', 'Teknolojik sistemler', 'bi-laptop', '#8B5CF6'),
('Diğer', 'Diğer konulardaki görüşler', 'bi-three-dots', '#6B7280');
```

### Complaint Kategorileri
```sql
INSERT INTO complaint_categories (name, description, sla_hours) VALUES
('Hizmet Kalitesi', 'Hizmet kalitesi şikayetleri', 48),
('Personel Davranışı', 'Personel davranışı şikayetleri', 24),
('Bekleme Süresi', 'Bekleme süresi şikayetleri', 24),
('Fiziksel Ortam', 'Fiziksel ortam şikayetleri', 72),
('Faturalama', 'Faturalama şikayetleri', 48),
('İletişim', 'İletişim şikayetleri', 24),
('Gizlilik', 'Hasta gizliliği şikayetleri', 12),
('Diğer', 'Diğer şikayetler', 48);
```

### Training Kategorileri
```sql
INSERT INTO training_categories (name, description, color) VALUES
('Kalite Yönetimi', 'Kalite yönetimi eğitimleri', '#3B82F6'),
('Hasta Güvenliği', 'Hasta güvenliği eğitimleri', '#EF4444'),
('İş Sağlığı ve Güvenliği', 'İSG eğitimleri', '#F59E0B'),
('Hizmet İçi Eğitim', 'Hizmet içi eğitimler', '#10B981'),
('Yasal Uyumluluk', 'Yasal uyumluluk eğitimleri', '#8B5CF6'),
('Teknik Eğitim', 'Teknik eğitimler', '#6B7280');