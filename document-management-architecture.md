# Doküman Yönetim Sistemi Mimarisi

## Sistem Akış Diyagramı

```mermaid
graph TB
    A[Kullanıcı Girişi] --> B{Kullanıcı Rolü}
    B -->|Personel| C[Doküman Görüntüleme]
    B -->|Şube Kalite| D[Şube Doküman Yönetimi]
    B -->|Merkez Kalite| E[Tüm Doküman Yönetimi]
    B -->|Admin| F[Tam Yetki Yönetimi]
    
    C --> G[Doküman Listeleme]
    C --> H[Doküman Arama]
    C --> I[Doküman İndirme]
    
    D --> G
    D --> H
    D --> I
    D --> J[Doküman Yükleme]
    D --> K[Doküman Düzenleme]
    D --> L[Doküman Silme]
    
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M[Kategori Yönetimi]
    
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N[Kullanıcı Yetkilendirme]
    
    G --> O[Veritabanı Sorgusu]
    H --> O
    I --> P[Dosya İndirme]
    J --> Q[Dosya Yükleme]
    K --> R[Veritabanı Güncelleme]
    L --> S[Veritabanı Silme]
    M --> T[Kategori İşlemleri]
    
    O --> U[(Supabase DB)]
    P --> V[(Supabase Storage)]
    Q --> V
    R --> U
    S --> U
    T --> U
```

## Veritabanı İlişkisi

```mermaid
erDiagram
    FACILITIES ||--o{ DOCUMENTS : "has"
    USERS ||--o{ DOCUMENTS : "uploads"
    DOCUMENT_CATEGORIES ||--o{ DOCUMENTS : "categorizes"
    DOCUMENT_CATEGORIES ||--o{ DOCUMENT_CATEGORIES : "parent-child"
    
    FACILITIES {
        int id PK
        string name
        string code
        string address
        string phone
        timestamp created_at
    }
    
    USERS {
        string id PK
        string email
        string display_name
        array role
        int facility_id FK
        int department_id
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENTS {
        uuid id PK
        string title
        text description
        uuid category_id FK
        string file_name
        string file_type
        bigint file_size
        string file_path
        int facility_id FK
        uuid uploaded_by FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENT_CATEGORIES {
        uuid id PK
        string name
        text description
        uuid parent_id FK
        timestamp created_at
    }
```

## Bileşen Mimarisi

```mermaid
graph TD
    A[App.tsx] --> B[Header.tsx]
    A --> C[Sidebar.tsx]
    A --> D[DocumentManagement.tsx]
    
    B --> E[Navigation]
    C --> E
    
    D --> F[DocumentList.tsx]
    D --> G[DocumentUpload.tsx]
    D --> H[SearchBar.tsx]
    D --> I[CategoryFilter.tsx]
    
    F --> J[DocumentCard.tsx]
    F --> K[Pagination.tsx]
    
    G --> L[FileUploader.tsx]
    G --> M[DocumentForm.tsx]
    
    J --> N[DocumentPreview.tsx]
    J --> O[DocumentActions.tsx]
    
    P[useDocuments.ts] --> D
    P --> F
    P --> G
    
    Q[useDocumentCategories.ts] --> I
    Q --> G
    
    R[supabase.ts] --> P
    R --> Q
```

## Dosya Yükleme Akışı

```mermaid
sequenceDiagram
    participant K as Kullanıcı
    participant UI as DocumentUpload
    participant Hook as useDocuments
    participant Supabase as Supabase
    participant Storage as Supabase Storage
    
    K->>UI: Dosya Seç
    UI->>UI: Form Doğrula
    K->>UI: Yükle Butonu
    UI->>Hook: uploadDocument(data)
    
    Hook->>Supabase: Dosya Yükle (Storage)
    Supabase->>Storage: Dosya Kaydet
    Storage-->>Supabase: File Path
    Supabase-->>Hook: Yükleme Sonucu
    
    Hook->>Supabase: Doküman Kaydet (DB)
    Supabase-->>Hook: Kayıt Sonucu
    Hook-->>UI: Başarı/Hata
    UI-->>K: Bilgi Mesajı
```

## Yetkilendirme Matrisi

| Rol | Görüntüleme | Yükleme | Düzenleme | Silme | Kategori Yönetimi |
|-----|-------------|---------|-----------|-------|-------------------|
| Personel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Şube Kalite | ✅ (Şube) | ✅ (Şube) | ✅ (Şube) | ✅ (Şube) | ❌ |
| Merkez Kalite | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ |
| Admin | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ (Tümü) | ✅ |

## Teknoloji Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Bootstrap Icons
- **Backend**: Supabase (PostgreSQL + Storage)
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **HTTP Client**: Supabase Client

## Performance Optimizasyonları

1. **Lazy Loading**: Doküman listesi sayfalama ile yüklenecek
2. **Image Optimization**: Önizleme görselleri optimize edilecek
3. **Caching**: Sık kullanılan dokümanlar önbelleğe alınacak
4. **Compression**: Dosyalar sıkıştırılarak depolanacak
5. **CDN**: Supabase CDN kullanılacak

## Güvenlik Önlemleri

1. **RLS (Row Level Security)**: Kullanıcı yetkilerine göre erişim kontrolü
2. **File Type Validation**: Sadece izinli dosya tipleri yüklenecek
3. **File Size Limit**: Maksimum dosya boyutu sınırı
4. **Virus Scanning**: Yüklenen dosyalar taranacak
5. **Audit Log**: Tüm işlemler kayıt altına alınacak

## Hata Yönetimi Stratejileri

1. **Network Errors**: Bağlantı hataları için retry mekanizması
2. **Validation Errors**: Form doğrulama hataları
3. **Upload Errors**: Dosya yükleme hataları
4. **Permission Errors**: Yetki hataları
5. **Storage Errors**: Depolama hataları