# Doküman Yönetim Sistemi Planı

## Proje Genel Bakış
Anadolu Hastaneleri İntranet Sistemi için kalite biriminin kullanabileceği doküman yönetim modülü geliştirilecektir. Bu modül, kalite prosedürleri, politika dokümanları, formlar, eğitim materyalleri ve denetim raporları gibi standart kalite dokümanlarını yönetecektir.

## Temel Özellikler
- Doküman yükleme ve indirme
- Doküman kategorizasyonu
- Doküman arama ve filtreleme
- Temel doküman bilgileri yönetimi

## Teknik Mimari

### 1. Veritabanı Şeması
```sql
-- Dokümanlar tablosu
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES document_categories(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  facility_id INTEGER REFERENCES facilities(id),
  uploaded_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doküman kategorileri tablosu
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES document_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. TypeScript Tipleri
```typescript
// Doküman tipleri
export interface Document {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  facility_id: number;
  uploaded_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
  uploader?: User;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  children?: DocumentCategory[];
}

// Doküman yükleme formu için
export interface DocumentFormData {
  title: string;
  description?: string;
  category_id: string;
  file: File;
}
```

### 3. Sayfa Yapısı
```
src/pages/DocumentManagement.tsx          // Ana doküman yönetim sayfası
src/components/documents/
├── DocumentList.tsx                      // Doküman listesi
├── DocumentCard.tsx                      // Doküman kartı
├── DocumentUpload.tsx                    // Doküman yükleme formu
├── DocumentPreview.tsx                   // Doküman önizleme
├── CategoryFilter.tsx                    // Kategori filtresi
├── SearchBar.tsx                         // Arama çubuğu
└── DocumentDetail.tsx                    // Doküman detay sayfası
```

### 4. Navigasyon Yapısı
Mevcut menü yapısına "Doküman Yönetimi" sekmesi eklenecek:
- Sidebar.tsx ve Header.tsx dosyalarına yeni menü öğesi eklenecek
- App.tsx'e yeni route eklenecek

### 5. API Hook'ları
```typescript
// src/hooks/useDocuments.ts
export const useDocuments = () => {
  // Dokümanları getirme, yükleme, silme işlemleri
};

// src/hooks/useDocumentCategories.ts
export const useDocumentCategories = () => {
  // Kategorileri getirme işlemleri
};
```

## Uygulama Adımları

### Adım 1: Veritabanı Şeması
- Supabase'de documents ve document_categories tablolarını oluşturma
- Gerekli indeksleri ve foreign key'leri tanımlama
- RLS (Row Level Security) politikalarını ayarlama

### Adım 2: TypeScript Tipleri
- Document ve DocumentCategory arayüzlerini tanımlama
- Form verileri için tipler oluşturma
- Veritabanı tiplerini güncelleme

### Adım 3: Sayfa ve Bileşenler
- Ana DocumentManagement sayfasını oluşturma
- Doküman listesi ve kart bileşenlerini geliştirme
- Yükleme formu ve önizleme bileşenlerini oluşturma

### Adım 4: Doküman Yükleme
- Dosya seçme ve yükleme işlevselliği
- Supabase Storage entegrasyonu
- İlerleme göstergesi ve hata yönetimi

### Adım 5: Listeleme ve Kategorizasyon
- Dokümanları kategoriye göre listeleme
- Kategori filtresi oluşturma
- Sayfalama implementasyonu

### Adım 6: Arama ve Filtreleme
- Başlığa göre arama işlevselliği
- Dosya tipine göre filtreleme
- Tarihe göre filtreleme seçeneği

### Adım 7: Önizleme ve İndirme
- Doküman önizleme penceresi
- İndirme işlevselliği
- Dosya tipi ikonları

### Adım 8: Navigasyon Entegrasyonu
- Menüye doküman yönetimi linkini ekleme
- Route yapılandırmasını güncelleme
- Yetki kontrolü implementasyonu

### Adım 9: API Hook'ları
- Doküman işlemleri için custom hook'lar
- Hata yönetimi ve loading durumları
- Cache mekanizması

### Adım 10: Test ve Hata Yönetimi
- Bileşen testleri
- Hata senaryolarını yönetme
- Kullanıcı geri bildirimleri

## Kullanıcı Rolleri ve Yetkilendirme
- **personel**: Sadece dokümanları görüntüleyebilir ve indirebilir
- **sube_kalite**: Kendi şubesine ait dokümanları yönetebilir
- **merkez_kalite**: Tüm dokümanları yönetebilir
- **admin**: Tam yetki

## UI/UX Tasarım Prensipleri
- Mevcut tasarım dilini koruma
- Temiz ve sezgisel arayüz
- Responsive tasarım
- Yüksek erişilebilirlik

## Gelecek Geliştirmeler
- Versiyon kontrolü
- Onay akışları
- Otomatik son kullanma tarihi hatırlatmaları
- Elektronik imza desteği
- Raporlama özellikleri