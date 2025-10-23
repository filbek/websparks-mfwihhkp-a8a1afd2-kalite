# Doküman Yönetim Sistemi

Anadolu Hastaneleri İntranet Sistemi için geliştirilen kalite birimi doküman yönetim modülü.

## Özellikler

- ✅ Doküman yükleme ve indirme
- ✅ Doküman kategorizasyonu
- ✅ Doküman arama ve filtreleme
- ✅ Rol bazlı erişim kontrolü
- ✅ Temel doküman bilgileri yönetimi

## Kurulum

### 1. Veritabanı Kurulumu

1. Supabase projenize giriş yapın
2. SQL Editor bölümüne gidin
3. `database-setup.sql` dosyasının içeriğini kopyalayıp çalıştırın
4. Storage bölümünden `documents` bucket'ını oluşturun (public: false)

### 2. Frontend Kurulumu

Tüm bileşenler ve hook'lar zaten projeye entegre edilmiştir. Sadece aşağıdaki adımları takip edin:

1. Gerekli tipler `src/types/documents.ts` dosyasında tanımlanmıştır
2. Hook'lar `src/hooks/` dizininde hazır durumdadır
3. Bileşenler `src/components/documents/` dizininde bulunmaktadır
4. Sayfa `src/pages/DocumentManagement.tsx` olarak eklenmiştir

### 3. Navigasyon

Doküman yönetimi menü öğesi "Komiteler" menüsünün üstüne eklenmiştir:
- Sol menüde "Doküman Yönetimi" seçeneği
- Üst menüde "Doküman Yönetimi" seçeneği

## Kullanım

### Roller ve Yetkiler

| Rol | Görüntüleme | Yükleme | Düzenleme | Silme | Kategori Yönetimi |
|-----|-------------|---------|-----------|-------|-------------------|
| Personel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Şube Kalite | ✅ (Şube) | ✅ (Şube) | ✅ (Şube) | ✅ (Şube) | ❌ |
| Merkez Kalite | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ |
| Admin | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ |

### Doküman Yükleme

1. "Doküman Yönetimi" sayfasına gidin
2. "Yeni Doküman Yükle" butonuna tıklayın
3. Formu doldurun:
   - Doküman başlığı (zorunlu)
   - Açıklama (opsiyonel)
   - Kategori (zorunlu)
   - Dosya seçimi (zorunlu)
4. "Yükle" butonuna tıklayın

### Doküman Arama ve Filtreleme

1. Arama çubuğuna kelime yazarak dokümanlarda arama yapın
2. Kategori filtresini kullanarak belirli bir kategorideki dokümanları listeleyin
3. Filtreler otomatik olarak uygulanır

### Doküman İndirme

1. Doküman listesinden istediğiniz dokümanı bulun
2. "İndir" butonuna tıklayın
3. Dosya otomatik olarak indirilecektir

### Doküman Silme

1. Yetkiniz varsa doküman kartındaki "Sil" butonuna tıklayın
2. Onay dialog'unda "Tamam" diyin
3. Doküman sistemden kalıcı olarak silinir

## Desteklenen Dosya Tipleri

- PDF: `.pdf`
- Microsoft Word: `.doc`, `.docx`
- Microsoft Excel: `.xls`, `.xlsx`
- Microsoft PowerPoint: `.ppt`, `.pptx`
- Resimler: `.jpg`, `.jpeg`, `.png`

## Dosya Boyutu Limiti

Maksimum dosya boyutu: 10MB

## Bileşen Yapısı

```
src/
├── types/
│   └── documents.ts                    # Doküman tipleri
├── hooks/
│   ├── useDocuments.ts                 # Doküman işlemleri hook'u
│   └── useDocumentCategories.ts        # Kategori işlemleri hook'u
├── components/documents/
│   ├── SearchBar.tsx                   # Arama çubuğu
│   ├── CategoryFilter.tsx              # Kategori filtresi
│   ├── DocumentCard.tsx                # Doküman kartı
│   ├── DocumentList.tsx                # Doküman listesi
│   └── DocumentUpload.tsx              # Doküman yükleme formu
└── pages/
    └── DocumentManagement.tsx          # Ana sayfa
```

## Hata Yönetimi

Sistem aşağıdaki hata durumlarını yönetir:

- **Dosya yükleme hataları**: Ağ veya dosya formatı sorunları
- **İndirme hataları**: Dosya bulunamadı veya erişim izni yok
- **Yetkilendirme hataları**: Yetersiz kullanıcı yetkileri
- **Veritabanı hataları**: Bağlantı veya sorgu sorunları

## Güvenlik

- Row Level Security (RLS) ile veri erişim kontrolü
- Dosya tipi ve boyu validasyonu
- Rol bazlı yetkilendirme
- Güvenli dosya depolama

## Performans Optimizasyonları

- Lazy loading ile doküman listesi
- Optimize edilmiş veritabanı sorguları
- İndeksleme ile hızlı arama
- Efficient file handling

## Gelecek Geliştirmeler

- [ ] Versiyon kontrolü
- [ ] Onay akışları
- [ ] Otomatik hatırlatmalar
- [ ] Elektronik imza desteği
- [ ] Gelişmiş raporlama
- [ ] Mobil uygulama desteği

## Sorun Giderme

### Doküman Yüklenemiyor
- Dosya boyutunun 10MB'dan küçük olduğundan emin olun
- Desteklenen dosya formatlarını kullandığınızdan emin olun
- İnternet bağlantınızın stabil olduğundan emin olun

### Doküman Görüntülenemiyor
- Kullanıcı rolünüzün görüntüleme yetkisi olduğundan emin olun
- Dokümanın aktif durumda olduğundan emin olun
- Filtrelerin doğru ayarlandığından emin olun

### İndirme Çalışmıyor
- Dosyanın storage'da mevcut olduğundan emin olun
- İndirme yetkinizin olduğundan emin olun
- Tarayıcı indirme ayarlarını kontrol edin

## İletişim

Sorularınız veya teknik destek için lütfen proje yöneticisi ile iletişime geçin.