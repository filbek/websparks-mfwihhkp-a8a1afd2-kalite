# Doküman Yönetimi Kategori Görünmeme Sorunu Çözüm Rehberi

## 🔍 Sorun Analizi

### Belirtilen Sorun:
Doküman yönetimi sekmesinde kategoriler listelenmiyor, hiç kategori görünmüyor.

### Olası Nedenler:

#### 1. Authentication Sorunu
- Kullanıcının sisteme giriş yapmamış olması
- Session'ın süresi dolmuş olması
- User role'ünün doğru ayarlanmaması

#### 2. RLS Politikası Sorunu
- Row Level Security politikasının kategorileri engelliyor olması
- Politika tanımında hata olması

#### 3. Frontend Cache Sorunu
- Browser'ın eski verileri cache'lemesi
- API'den gelen yeni verilerin gösterilmemesi

#### 4. Network/API Sorunu
- Supabase bağlantısında sorun olması
- API isteğinin başarısız olması
- CORS sorunu

#### 5. Component State Sorunu
- useDocumentCategories hook'ındaki state'in düzgün yönetilmemesi
- Component'in yeniden render edilmemesi

## 🛠️ Çözüm Adımları

### Adım 1: Hata Ayıklama ve Debug

#### 1.1. Browser Console Kontrolü
```javascript
// Browser'da F12 ile developer tools'u açın ve Console tab'ına gidin
// Aşağıdaki komutları çalıştırın:

// 1. Supabase bağlantısını kontrol et
console.log('Supabase client:', supabase);

// 2. Mevcut user'ı kontrol et
console.log('Current user:', await supabase.auth.getUser());

// 3. Session'ı kontrol et
console.log('Current session:', await supabase.auth.getSession());

// 4. document_categories tablosuna doğrudan erişmeyi dene
console.log('Direct categories query:', await supabase.from('document_categories').select('*'));
```

#### 1.2. Network Sekmesini Kontrol Et
```javascript
// Browser'da Network tab'ına gidin ve document_categories tablosuna yapılan isteği kontrol et
// Hata kodlarını ve response'ları inceleyin
```

#### 1.3. Local Storage Temizleme
```javascript
// Browser'da Application sekmesine gidin ve Local Storage'ı temizle
localStorage.clear();
sessionStorage.clear();
```

### Adım 2: Authentication Kontrolü

#### 2.1. Kullanıcı Girişini Sağla
```typescript
// src/contexts/AuthContext.tsx dosyasında şu kontrolü yapın:

const checkAuthStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Auth check - Session:', session);
  console.log('Auth check - User:', await supabase.auth.getUser());
  
  if (!session) {
    console.error('No active session found');
    return false;
  }
  
  return true;
};
```

#### 2.2. User Role'ünü Doğru Ayarla
```typescript
// Login olduğunda user role'ünü doğru ayarladığınızdan emin olun:

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  // User role'ünü kontrol et
  if (data.user && data.user.user_metadata && data.user.user_metadata.role) {
    console.log('User role:', data.user.user_metadata.role);
    
    // App context'ine role'ü set et
    setUserRole(data.user.user_metadata.role);
  } else {
    console.warn('User role not found in metadata');
  }
};
```

### Adım 3: RLS Politikası Kontrolü

#### 3.1. Mevcut Politikaları Kontrol Et
```sql
-- Supabase SQL Editor'da şu sorguyu çalıştırın:

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'document_categories'
ORDER BY policyname;
```

#### 3.2. Politikayı Geçici Olarak Devre Dışı Bırak
```sql
-- Eğer RLS politikası soruna neden oluyorsa, geçici olarak devre dışı bırakın:

ALTER TABLE document_categories DISABLE ROW LEVEL SECURITY;

-- Test edin
SELECT * FROM document_categories;

-- Sonra tekrar etkinleştirin
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
```

#### 3.3. Basitleştirilmiş RLS Politikası
```sql
-- Mevcut politikaları silin ve daha basit bir politika oluşturun:

DROP POLICY IF EXISTS "All authenticated users can view categories" ON document_categories;
DROP POLICY IF EXISTS "Only quality managers and admins can manage categories" ON document_categories;

-- Yeni basit politika
CREATE POLICY "Anyone can view categories" ON document_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON document_categories
    FOR ALL USING (auth.role() = 'authenticated');
```

### Adım 4: Component State Kontrolü

#### 4.1. useDocumentCategories Hook'ını Debug Et
```typescript
// src/hooks/useDocumentCategories.ts dosyasında şu değişiklikleri yapın:

export const useDocumentCategories = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug için user bilgisini kontrol et
      console.log('Fetching categories - User:', await supabase.auth.getUser());
      console.log('Fetching categories - Session:', await supabase.auth.getSession());
      
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');
      
      // Debug için response'u kontrol et
      console.log('Categories response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Setting categories:', data || []);
      setCategories(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
```

#### 4.2. Component'i Zorla Yeniden Render Et
```typescript
// src/pages/DocumentManagement.tsx dosyasında şu değişikliği yapın:

export const DocumentManagement: React.FC = () => {
  // ... mevcut kod
  
  // Zorla yeniden render tetikleyici
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    // 5 saniyede bir kez component'i yeniden render et
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // ... geri kalan kod
};
```

### Adım 5. Cache Temizleme

#### 5.1. Browser Cache'ini Temizle
```javascript
// Component'in mount olduğu anda cache'i temizle

useEffect(() => {
  // Cache busting için timestamp ekle
  const timestamp = new Date().getTime();
  localStorage.setItem('categories_cache_bust', timestamp.toString());
  
  return () => {
    localStorage.removeItem('categories_cache_bust');
  };
}, []);
```

#### 5.2. API Request'ine Cache Busting Ekle
```typescript
// Her API request'ine benzersiz bir parametre ekle

const fetchCategories = async () => {
  try {
    const cacheBust = new Date().getTime();
    
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name')
      // Cache busting header'ı ekle
      .header('Cache-Control', 'no-cache')
      .header('Pragma', 'no-cache')
      // Benzersiz parametre ekle
      .eq('t', cacheBust.toString());
    
    // ... geri kalan kod
  } catch (err) {
    // ... hata yönetimi
  }
};
```

## 🚨 Hata Tespit Senaryoları

### Senaryo 1: Authentication Sorunu
**Belirtiler**: Kullanıcı giriş yapmamış, console'da user null görünüyor
**Çözüm**: Authentication kontrolü ve login sağla

### Senaryo 2: RLS Politikası Sorunu
**Belirtiler**: Kategoriler veritabanında var ama frontend'de görünmüyor
**Çözüm**: RLS politikasını kontrol et ve basitleştir

### Senaryo 3: Cache Sorunu
**Belirtiler**: Yeni kategori eklenmesine rağmen eski veriler gösteriliyor
**Çözüm**: Cache temizleme ve cache busting

### Senaryo 4: Network Sorunu
**Belirtiler**: API isteği başarısız, network hatası
**Çözüm**: Network sekmesini kontrol et ve hata yönetimi

## 📋 Kontrol Listesi

### ✅ Yapılması Gereken Kontroller:
- [ ] Browser console'da Supabase bağlantısını kontrol et
- [ ] Mevcut user ve session'ı doğrula
- [ ] document_categories tablosuna doğrudan erişmeyi dene
- [ ] Network sekmesinde API isteklerini kontrol et
- [ ] Local storage'ı temizle ve sayfayı yenile
- [ ] useDocumentCategories hook'una debug log'ları ekle
- [ ] Component'i zorla yeniden render et

### 🔧 Uygulanacak Çözümler:
1. **Authentication**: Kullanıcı giriş kontrolü ve role ayarı
2. **RLS Politikası**: Politikayı basitleştir veya geçici devre dışı bırakma
3. **Cache**: Cache temizleme ve cache busting
4. **Debug**: Detaylı log'lar ekleme ve console kontrolü
5. **Network**: Bağlantı ve API isteklerini kontrol et

## 📞 Destek Ekranları

### Hata Mesajları:
```typescript
// Kullanıcıya gösterilecek hata mesajları

const ERROR_MESSAGES = {
  NO_CATEGORIES: 'Doküman kategorileri yüklenemedi. Lütfen sayfayı yenileyin.',
  AUTH_REQUIRED: 'Bu işlemi yapmak için giriş yapmanız gerekmektedir.',
  NETWORK_ERROR: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  PERMISSION_DENIED: 'Bu işlem için yetkiniz bulunmamaktadır.'
};
```

### Loading State:
```typescript
// Kullanıcıya yükleme durumunu göster

const [loading, setLoading] = useState(true);

// Component'te loading göstergesi
{loading && (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    <p className="ml-2">Kategoriler yükleniyor...</p>
  </div>
)}
```

---

**Önemli Not**: Bu rehberdeki adımları sırayla uygulayın ve her adımdan sonra sonucu kontrol edin. Eğer sorun devam ederse, Supabase dashboard üzerinden doğrudan veritabanını kontrol etmeyi düşünün.