# Supabase Veritabanı Kurulum Rehberi

Bu rehber, Supabase'te Görüş-Öneri sistemi için gerekli tabloları sizin yerinize oluşturmak için hazırlanmıştır.

## Kurulum Adımları

### Adım 1: exec_sql Fonksiyonunu Oluşturun

1. Supabase dashboard'a gidin: https://vrdpaqndholgfowlcghl.supabase.co
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. `create-exec-sql-function.sql` dosyasındaki kodları kopyalayın ve SQL Editor'a yapıştırın
4. "Run" butonuna tıklayarak fonksiyonu oluşturun

```sql
-- Function to execute arbitrary SQL (for admin operations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    BEGIN
        EXECUTE sql;
        RETURN SELECT true, 'SQL executed successfully'::text;
    EXCEPTION WHEN others THEN
        RETURN SELECT false, SQLERRM::text;
    END;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

### Adım 2: Veritabanı Kurulumu

Sistemimizde iki farklı kurulum seçeneği bulunmaktadır:

#### Seçenek A: Web Arayüzü ile Kurulum

1. Uygulamayı çalıştırın (npm run dev)
2. Tarayıcıda http://localhost:5173 adresine gidin
3. Veritabanı kurulumu için özel bir sayfa oluşturduk
4. "Tabloları Kur" butonuna tıklayarak tüm işlemleri otomatik olarak gerçekleştirin

#### Seçenek B: Manuel Kurulum

Eğer web arayüzünü kullanmak istemiyorsanız, `feedback-database-setup.sql` dosyasındaki kodları manuel olarak çalıştırabilirsiniz.

### Adım 3: Kurulumu Kontrol Etme

Kurulumun başarılı olup olmadığını kontrol etmek için:

1. Supabase dashboard'da "Table Editor" seçeneğine gidin
2. Aşağı tabloların görünüldüğünden emin olun:
   - feedback_categories
   - feedback_suggestions
   - feedback_responses
   - feedback_votes

3. Veya SQL Editor'de şu sorguyu çalıştırın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'feedback_%'
ORDER BY table_name;
```

## Otomatik Kurulum Sistemi

Sistemimizde tam otomatik bir kurulum mekanizması bulunmaktadır:

### Ne Yapılır?

1. **Tablo Oluşturma**: 4 adet feedback tablosu oluşturulur
2. **İndeks Ekleme**: Performans için indeksler eklenir
3. **Trigger Oluşturma**: updated_at kolonu için trigger'lar oluşturulur
4. **RLS Aktifleştirme**: Row Level Security politikaları aktifleştirilir
5. **Varsayılan Veri**: Kategoriler ve test verileri eklenir

### Kullanıcı Bilgileri

Sistem aşağı kullanıcıları otomatik olarak oluşturur:

- **Bekir Filizdağ** (bekir.filizdag@anadoluhastaneleri.com) - Admin
- **Dr. Mehmet Yılmaz** (mehmet.yilmaz@anadoluhastaneleri.com) - Merkez Kalite
- **Bilgehan BATUR** (bilgehan.batur@anadoluhastaneleri.com) - Silivri Şubesi
- **Fatma Yılmaz** (fatma.yilmaz@anadoluhastaneleri.com) - Avcılar Şubesi
- **Zuhal Aktaş** (zuhal.aktas@anadoluhastaneleri.com) - Ereğli Şubesi

### Şube Bilgileri

- **Merkez Şube** (ID: 1)
- **Silivri Şubesi** (ID: 2)
- **Avcılar Şubesi** (ID: 3)
- **Ereğli Şubesi** (ID: 4)

## Sorun Giderme

### exec_sql Fonksiyonu Hatası

Eğer "function exec_sql does not exist" hatası alırsanız:
1. Adım 1'deki exec_sql fonksiyonunu oluşturun
2. Fonksiyonun doğru oluşturulduğundan emin olun

### Permission Hataları

Eğer permission ile ilgili hatalar alırsanız:
1. Supabase dashboard'da "Authentication" > "Policies" bölümüne gidin
2. RLS politikalarının doğru ayarlandığını kontrol edin

### Tablo Oluşturma Hataları

Eğer tablo oluşturma sırasında hata alırsanız:
1. SQL kodunu dikkatlice kontrol edin
2. Mevcut tabloların olup olmadığını kontrol edin
3. Foreign key ilişkilerinin doğru olduğundan emin olun

## Kurulum Sonrası

Kurulum tamamlandıktan sonra:

1. Sistemi test edin
2. Farklı kullanıcı rolleriyle giriş yapın
3. Görüş oluşturma ve yönetme işlemlerini test edin
4. Filtreleme ve arama özelliklerini kontrol edin

## Teknik Özellikler

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Security**: Row Level Security (RLS)

## Destek

Sorun yaşarsanız:
1. Supabase dashboard'daki logları kontrol edin
2. Browser console'daki hataları inceleyin
3. Bu rehberdeki adımları tekrar kontrol edin

Sistem şu an tamamen otomatik kurulum ile çalışmaya hazır durumdadır. Tek yapmanız gereken exec_sql fonksiyonunu oluşturup "Tabloları Kur" butonuna tıklamaktır.