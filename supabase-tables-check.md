# Supabase Tabloları Kontrol Script'i

## Mevcut Tabloları Listeleme

Supabase SQL Editor'de (https://vrdpaqndholgfowlcghl.supabase.co) aşağı SQL sorgularını çalıştırarak tabloları kontrol edebilirsiniz.

### 1. Tüm Tabloları Listele

```sql
-- Mevcut tüm tabloları listele
SELECT table_name, table_schema, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Tablo Detaylarını Görüntüle

```sql
-- Her tablonun kolon bilgilerini görüntüle
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;
```

### 3. Feedback Tablolarını Kontrol Et

```sql
-- Feedback sistemine ait tabloları kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'feedback_%'
ORDER BY table_name;
```

### 4. İndeksleri Kontrol Et

```sql
-- Mevcut indeksleri listele
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 5. Trigger'ları Kontrol Et

```sql
-- Mevcut trigger'ları listele
SELECT 
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### 6. RLS Politikalarını Kontrol Et

```sql
-- Row Level Security politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 7. Kullanıcı Tablosunu Kontrol Et

```sql
-- Users tablosunu kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 8. Test Verilerini Kontrol Et

```sql
-- Test kullanıcılarını kontrol et
SELECT id, email, display_name, role, facility_id, is_active
FROM users
ORDER BY display_name;
```

### 9. Facilities Tablosunu Kontrol Et

```sql
-- Facilities tablosunu kontrol et (varsa)
SELECT * FROM facilities ORDER BY id;
```

### 10. Feedback Kategorilerini Kontrol Et

```sql
-- Feedback kategorilerini kontrol et
SELECT id, name, description, icon, color, is_active
FROM feedback_categories
ORDER BY name;
```

### 11. Test Görüşlerini Kontrol Et

```sql
-- Test görüşlerini kontrol et
SELECT 
    id, title, category_id, reporter_id, facility_id, 
    priority, status, is_anonymous, created_at
FROM feedback_suggestions
ORDER BY created_at DESC;
```

## Beklenen Tablolar

Sistemimizde aşağı tabloların olması gerekiyor:

### Mevcut Tablolar (Olmadan Önce)
- facilities
- users
- dofs (DÖF tablosu)
- events (Olay tablosu)
- documents (Doküman tablosu)
- document_categories

### Yeni Eklenen Tablolar (Feedback Sistemi için)
- feedback_categories
- feedback_suggestions
- feedback_responses
- feedback_votes

## Kontrol Listesi

- [ ] Tüm tablolar oluşturuldu mu?
- [ ] İndeksler tanımlandı mı?
- [ ] Trigger'lar çalışıyor mu?
- [ ] RLS politikaları aktif mi?
- [ ] Test kullanıcıları var mı?
- [ ] Test verileri eklendi mi?
- [ ] Foreign key ilişkileri doğru mu?
- [ ] Veri tipleri doğru mu?

## Hata Tespiti

Eğer bir tablo eksikse veya hata varsa, aşağı adımları uygulayın:

1. **Tablo Oluşturma**: `feedback-database-setup.sql` dosyasındaki CREATE TABLE ifadelerini çalıştırın
2. **İndeks Ekleme**: CREATE INDEX ifadelerini çalıştırın
3. **Trigger Oluşturma**: CREATE TRIGGER ifadelerini çalıştırın
4. **RLS Aktifleştirme**: ALTER TABLE ... ENABLE ROW LEVEL SECURITY ifadelerini çalıştırın
5. **Veri Ekleme**: INSERT ifadelerini çalıştırın

## Supabase Dashboard Kontrol Adımları

1. https://vrdpaqndholgfowlcghl.supabase.co adresine gidin
2. Sol menüden "Table Editor" seçeneğine tıklayın
3. Tabloların görünür olduğundan emin olun
4. Her tabloya tıklayarak verileri kontrol edin
5. Sol menüden "SQL Editor" seçeneğine tıklayın
6. Yukarıdaki SQL sorgularını çalıştırın

## Sonuç

Bu kontrol script'ini çalıştırdıktan sonra:
- Eksik tabloları belirleyebilirsiniz
- Veri tutarlılığını kontrol edebilirsiniz
- Sistem durumunu değerlendirebilirsiniz

Sorun yaşarsanız, `feedback-database-setup.sql` dosyasını baştan çalıştırmanızı öneririm.