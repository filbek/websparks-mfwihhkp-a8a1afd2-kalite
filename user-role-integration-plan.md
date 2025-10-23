# Mevcut Kullanıcı Rol Sistemi ile Entegrasyon Planı

## Mevcut Rol Sistemi

### Mevcut Roller
- **personel**: Temel kullanıcı rolü
- **sube_kalite**: Şube kalite sorumlusu
- **merkez_kalite**: Merkez kalite yöneticisi
- **admin**: Sistem yöneticisi

### Mevcut Yetki Yapısı
```typescript
export interface User {
  id: string;
  email: string;
  display_name: string;
  role: ('personel' | 'sube_kalite' | 'merkez_kalite' | 'admin')[];
  facility_id: number;
  department_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Yeni Modüller için Rol Bazlı Yetkilendirme

### 1. Görüş-Öneri Sistemi Yetkileri

#### Personel Rolü
- ✅ Görüş oluşturma (kendi adına veya anonim)
- ✅ Kendi görüşlerini görüntüleme
- ✅ Kendi görüşlerini düzenleme (durum 'yeni' ise)
- ✅ Kendi görüşlerini silme (durum 'yeni' ise)
- ✅ Diğer görüşleri görüntüleme (sadece şubesindeki)
- ✅ Oylama yapma
- ❌ Başka kullanıcıların görüşlerini düzenleme
- ❌ Görüş yanıtlama
- ❌ Kategori yönetimi

#### Şube Kalite Rolü
- ✅ Tüm personel yetkileri
- ✅ Şubesindeki tüm görüşleri görüntüleme
- ✅ Şubesindeki görüşlere yanıt verme
- ✅ Şubesindeki görüşlerin durumunu güncelleme
- ✅ Şubesindeki görüşleri silme
- ✅ Şubesindeki görüş raporları
- ❌ Diğer şubelerin görüşlerini yönetme
- ❌ Kategori yönetimi

#### Merkez Kalite Rolü
- ✅ Tüm şube kalite yetkileri
- ✅ Tüm şubelerdeki görüşleri yönetme
- ✅ Kategori yönetimi (oluşturma, düzenleme, silme)
- ✅ Sistem genelinde raporlama
- ✅ İstatistikleri görüntüleme
- ✅ Görüşleri farklı şubelere atama

#### Admin Rolü
- ✅ Tüm merkez kalite yetkileri
- ✅ Sistem konfigürasyonu
- ✅ Kullanıcı yetkilerini yönetme
- ✅ Veritabanı yönetimi
- ✅ Sistem loglarını görüntüleme

### 2. Şikayet Yönetimi CRM Yetkileri

#### Personel Rolü
- ✅ Şikayet oluşturma
- ✅ Kendi atandığı şikayetleri görüntüleme
- ✅ Atandığı şikayetlere yanıt ekleme
- ✅ Atandığı şikayetlerin durumunu güncelleme
- ✅ Şikayet dosyalarını yönetme
- ❌ Şikayet atama yapma
- ❌ Başka şikayetleri görüntüleme
- ❌ Raporlama

#### Şube Kalite Rolü
- ✅ Tüm personel yetkileri
- ✅ Şubesindeki tüm şikayetleri görüntüleme
- ✅ Şubesindeki şikayetleri personele atama
- ✅ Şubesindeki şikayetlerin durumunu yönetme
- ✅ Şubesindeki şikayet raporları
- ✅ Müşteri memnuniyet anketleri
- ❌ Diğer şubelerin şikayetlerini yönetme
- ❌ Kategori yönetimi

#### Merkez Kalite Rolü
- ✅ Tüm şube kalite yetkileri
- ✅ Tüm şubelerdeki şikayetleri yönetme
- ✅ Şikayetleri farklı şubelere/departmanlara atama
- ✅ Kategori yönetimi
- ✅ SLA (Service Level Agreement) yönetimi
- ✅ Sistem genelinde raporlama
- ✅ İstatistiksel analiz
- ✅ Müşteri memnuniyet yönetimi

#### Admin Rolü
- ✅ Tüm merkez kalite yetkileri
- ✅ Sistem konfigürasyonu
- ✅ Şikayet numarası formatı yönetimi
- ✅ Otomatik atama kuralları
- ✅ E-posta/SMS template'leri
- ✅ Sistem entegrasyonları

### 3. Eğitim Yönetim Sistemi Yetkileri

#### Personel Rolü
- ✅ Tüm eğitimleri görüntüleme
- ✅ Eğitimlere kayıt olma
- ✅ Kendi katılımını yönetme
- ✅ Eğitim materyallerini indirme
- ✅ Quiz'lere katılma
- ✅ Sertifikalarını indirme
- ✅ Eğitimlere geri bildirim yapma
- ❌ Eğitim oluşturma
- ❌ Eğitmen atama
- ❌ Katılımı güncelleme

#### Şube Kalite Rolü
- ✅ Tüm personel yetkileri
- ✅ Şubesinde eğitim planlama
- ✅ Şubesindeki eğitimleri yönetme
- ✅ Şube personeli için eğitim atama
- ✅ Katılım durumlarını güncelleme
- ✅ Şube eğitim raporları
- ✅ Eğitmenleri yönetme (şube içi)
- ❌ Kurumsal eğitimleri yönetme
- ❌ Sertifika şablonları

#### Merkez Kalite Rolü
- ✅ Tüm şube kalite yetkileri
- ✅ Kurumsal eğitim programları oluşturma
- ✅ Tüm eğitimleri yönetme
- ✅ Eğitmen atama ve yönetme
- ✅ Sertifika şablonları
- ✅ Quiz'ler oluşturma
- ✅ Sistem genelinde raporlama
- ✅ Eğitim bütçesi yönetimi
- ✅ Dış eğitim sağlayıcıları

#### Admin Rolü
- ✅ Tüm merkez kalite yetkileri
- ✅ Sistem konfigürasyonu
- ✅ Eğitmen veritabanı
- ✅ Sertifika doğrulama sistemi
- ✃ Eğitim platformu entegrasyonları
- ✅ Otomatik hatırlatmalar
- ✅ Veri yedekleme

## Entegrasyon Stratejisi

### 1. Veritabanı Seviyesinde Entegrasyon

#### Row Level Security (RLS) Politikaları
```sql
-- Context ayarları için fonksiyon
CREATE OR REPLACE FUNCTION set_user_context()
RETURNS void AS $$
BEGIN
  -- Kullanıcı bilgilerini session variable'lara set et
  PERFORM set_config('app.current_user_id', auth.uid(), true);
  PERFORM set_config('app.current_user_role', current_setting('app.user_role'), true);
  PERFORM set_config('app.current_user_facility_id', current_setting('app.user_facility_id'), true);
END;
$$ LANGUAGE plpgsql;

-- Her bağlantıda context'i set et
CREATE POLICY "User context policy" ON ALL TABLES
  FOR ALL TO authenticated
  USING (set_user_context() IS NOT NULL);
```

#### Facility Bazlı Filtreleme
```sql
-- Personel sadece kendi şubesindeki verileri görebilir
CREATE POLICY "Personel facility filter" ON feedback_suggestions
  FOR SELECT USING (
    current_setting('app.current_user_role') = 'personel' AND
    facility_id = current_setting('app.current_user_facility_id')::integer
  );

-- Şube kalite kendi şubesindeki verileri yönetebilir
CREATE POLICY "Branch quality facility filter" ON feedback_suggestions
  FOR ALL USING (
    current_setting('app.current_user_role') = 'sube_kalite' AND
    facility_id = current_setting('app.current_user_facility_id')::integer
  );
```

### 2. Uygulama Seviyesinde Entegrasyon

#### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessFacility: (facilityId: number) => boolean;
}

// Permission kontrol fonksiyonları
const PERMISSIONS = {
  // Feedback permissions
  'feedback:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:view_all': ['sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:respond': ['sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:manage_categories': ['merkez_kalite', 'admin'],
  
  // Complaint permissions
  'complaint:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'complaint:view_all': ['sube_kalite', 'merkez_kalite', 'admin'],
  'complaint:assign': ['sube_kalite', 'merkez_kalite', 'admin'],
  'complaint:manage_categories': ['merkez_kalite', 'admin'],
  
  // Training permissions
  'training:view_all': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'training:create': ['sube_kalite', 'merkez_kalite', 'admin'],
  'training:manage_all': ['merkez_kalite', 'admin'],
  'training:issue_certificates': ['sube_kalite', 'merkez_kalite', 'admin'],
};
```

#### Custom Hook
```typescript
// usePermissions hook
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = PERMISSIONS[permission] || [];
    return user.role.some(role => allowedRoles.includes(role));
  }, [user]);
  
  const canAccessFacility = useCallback((facilityId: number): boolean => {
    if (!user) return false;
    
    // Admin ve merkez kalite tüm şubelere erişebilir
    if (user.role.includes('admin') || user.role.includes('merkez_kalite')) {
      return true;
    }
    
    // Şube kalite ve personel sadece kendi şubesine erişebilir
    return user.facility_id === facilityId;
  }, [user]);
  
  const canManageData = useCallback((data: any): boolean => {
    if (!user) return false;
    
    // Admin ve merkez kalite tüm verileri yönetebilir
    if (user.role.includes('admin') || user.role.includes('merkez_kalite')) {
      return true;
    }
    
    // Şube kalite kendi şubesindeki verileri yönetebilir
    if (user.role.includes('sube_kalite')) {
      return data.facility_id === user.facility_id;
    }
    
    // Personel sadece kendi verilerini yönetebilir
    if (user.role.includes('personel')) {
      return data.reporter_id === user.id || data.assigned_to === user.id;
    }
    
    return false;
  }, [user]);
  
  return {
    hasPermission,
    canAccessFacility,
    canManageData,
    isPersonel: user?.role.includes('personel') || false,
    isBranchQuality: user?.role.includes('sube_kalite') || false,
    isCenterQuality: user?.role.includes('merkez_kalite') || false,
    isAdmin: user?.role.includes('admin') || false,
  };
};
```

### 3. Bileşen Seviyesinde Entegrasyon

#### Conditional Rendering
```typescript
// Permission-based component rendering
const FeedbackActions: React.FC<{ feedback: FeedbackSuggestion }> = ({ feedback }) => {
  const { hasPermission, canManageData } = usePermissions();
  
  return (
    <div className="flex space-x-2">
      {hasPermission('feedback:respond') && canManageData(feedback) && (
        <Button onClick={() => onRespond(feedback.id)}>
          Yanıtla
        </Button>
      )}
      
      {hasPermission('feedback:manage_categories') && (
        <Button onClick={() => onEditCategory(feedback.category_id)}>
          Kategoriyi Düzenle
        </Button>
      )}
      
      {canManageData(feedback) && (
        <Button onClick={() => onEdit(feedback.id)}>
          Düzenle
        </Button>
      )}
    </div>
  );
};
```

#### Route Protection
```typescript
// ProtectedRoute component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  permissions?: string[];
  facilities?: number[];
}> = ({ children, permissions = [], facilities = [] }) => {
  const { hasPermission, canAccessFacility } = usePermissions();
  
  const hasAllPermissions = permissions.every(permission => hasPermission(permission));
  const canAccessAnyFacility = facilities.length === 0 || 
    facilities.some(facility => canAccessFacility(facility));
  
  if (!hasAllPermissions || !canAccessAnyFacility) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage
<Route path="/feedback" element={
  <ProtectedRoute permissions={['feedback:view_all']}>
    <FeedbackManagement />
  </ProtectedRoute>
} />
```

### 4. API Seviyesinde Entegrasyon

#### Middleware
```typescript
// Supabase middleware for context setting
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // Kullanıcı rolünü ve şube bilgisini getir
    const { data: userData } = await supabase
      .from('users')
      .select('role, facility_id')
      .eq('id', session.user.id)
      .single();
    
    if (userData) {
      // Session variable'ları set et
      await supabase.rpc('set_user_context');
    }
  }
});
```

#### API Wrapper
```typescript
// Permission-aware API calls
const apiClient = {
  async getFeedback(filters?: FeedbackFilters) {
    const { hasPermission, canAccessFacility } = usePermissions.getState();
    
    let query = supabase.from('feedback_suggestions').select('*');
    
    // Personel ise sadece kendi şubesindeki verileri getir
    if (hasPermission('personel')) {
      query = query.eq('facility_id', user.facility_id);
    }
    
    // Filtreleri uygula
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value);
      });
    }
    
    return query;
  },
  
  async createFeedback(data: FeedbackFormData) {
    // Permission kontrolü
    if (!hasPermission('feedback:create')) {
      throw new Error('Yetkisiz erişim');
    }
    
    return supabase.from('feedback_suggestions').insert({
      ...data,
      facility_id: user.facility_id,
      reporter_id: user.id,
    });
  },
};
```

## Güvenlik Önlemleri

### 1. Client-Side Validation
```typescript
// Form submission permission check
const handleSubmit = async (data: any) => {
  if (!hasPermission('feedback:create')) {
    toast.error('Bu işlem için yetkiniz yok');
    return;
  }
  
  try {
    await apiClient.createFeedback(data);
    toast.success('Görüşünüz başarıyla oluşturuldu');
  } catch (error) {
    toast.error('Bir hata oluştu');
  }
};
```

### 2. Server-Side Validation
```sql
-- RLS policies ile server-side validation
CREATE POLICY "Feedback creation policy" ON feedback_suggestions
  FOR INSERT WITH CHECK (
    -- Sadece yetkili kullanıcılar oluşturabilir
    current_setting('app.current_user_role') = ANY(ARRAY['personel', 'sube_kalite', 'merkez_kalite', 'admin'])
    AND
    -- Personel kendi şubesine oluşturabilir
    (
      current_setting('app.current_user_role') != 'personel' OR
      facility_id = current_setting('app.current_user_facility_id')::integer
    )
  );
```

### 3. Audit Logging
```sql
-- Audit log tablosu
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    current_setting('app.current_user_id'),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Test Stratejisi

### 1. Unit Tests
```typescript
// Permission hook tests
describe('usePermissions', () => {
  it('should allow admin to access all facilities', () => {
    const user = { role: ['admin'], facility_id: 1 };
    const { canAccessFacility } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={{ user }}>
          {children}
        </AuthContext.Provider>
      ),
    }).result.current;
    
    expect(canAccessFacility(1)).toBe(true);
    expect(canAccessFacility(2)).toBe(true);
  });
  
  it('should allow branch quality to access only own facility', () => {
    const user = { role: ['sube_kalite'], facility_id: 1 };
    const { canAccessFacility } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={{ user }}>
          {children}
        </AuthContext.Provider>
      ),
    }).result.current;
    
    expect(canAccessFacility(1)).toBe(true);
    expect(canAccessFacility(2)).toBe(false);
  });
});
```

### 2. Integration Tests
```typescript
// API permission tests
describe('Feedback API', () => {
  it('should allow personel to create feedback in own facility', async () => {
    const personelUser = await createTestUser({ role: ['personel'], facility_id: 1 });
    
    const response = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${personelUser.token}`)
      .send({
        title: 'Test Feedback',
        content: 'Test Content',
        facility_id: 1,
      });
    
    expect(response.status).toBe(201);
  });
  
  it('should reject personel creating feedback in other facility', async () => {
    const personelUser = await createTestUser({ role: ['personel'], facility_id: 1 });
    
    const response = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${personelUser.token}`)
      .send({
        title: 'Test Feedback',
        content: 'Test Content',
        facility_id: 2,
      });
    
    expect(response.status).toBe(403);
  });
});
```

## Migration Planı

### 1. Mevcut Verileri Koruma
- Mevcut kullanıcı rollerini koruma
- Yeni izinleri mevcut rollere ekleme
- Veri bütünlüğünü sağlama

### 2. Aşamalı Geçiş
1. **Faz 1**: Yeni tablolar ve RLS politikaları
2. **Faz 2**: Permission sistemi implementasyonu
3. **Faz 3**: UI entegrasyonu
4. **Faz 4**: Test ve validation
5. **Faz 5**: Production deploy

### 3. Geri Dönüş Planı
- Önceki sisteme dönüş script'leri
- Veri yedekleme stratejileri
- Rollback planları

Bu entegrasyon planı, mevcut kullanıcı rol sistemiyle tam uyumlu şekilde yeni modüllerin güvenli ve efektif bir şekilde çalışmasını sağlayacaktır.