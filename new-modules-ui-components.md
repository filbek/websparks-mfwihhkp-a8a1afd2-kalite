# Yeni Modüller UI/UX Bileşen Tasarımları

## 1. Görüş-Öneri Sistemi Bileşenleri

### FeedbackList
```typescript
interface FeedbackListProps {
  feedbacks: FeedbackSuggestion[];
  loading: boolean;
  onVote: (feedbackId: string, voteType: 'up' | 'down') => void;
  onViewDetails: (feedback: FeedbackSuggestion) => void;
  onRespond: (feedbackId: string) => void;
  currentUserRole: UserRole;
}

// Görsel Tasarım:
// - Kart formatında liste
// - Her kartta: başlık, özet, kategori, öncelik, durum, oylama butonları
// - Sol tarafta renkli öncelik göstergesi
// - Sağ tarafta durum badge'i ve aksiyon butonları
// - Alt kısımda: oy sayısı, yorum sayısı, tarih
```

### FeedbackCard
```typescript
interface FeedbackCardProps {
  feedback: FeedbackSuggestion;
  showActions?: boolean;
  onVote: (voteType: 'up' | 'down') => void;
  onViewDetails: () => void;
  onRespond?: () => void;
  compact?: boolean;
}

// Görsel Tasarım:
// - Başlık (büyük font, bold)
// - İçerik özeti (2-3 satır)
// - Meta bilgiler (kategori, tarih, kişi)
// - Oylama butonları (thumb up/down)
// - Durum göstergesi (renkli badge)
// - Etiketler (varsa)
```

### FeedbackForm
```typescript
interface FeedbackFormProps {
  categories: FeedbackCategory[];
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<FeedbackFormData>;
}

// Görsel Tasarım:
// - Modal içinde form
// - Başlık input'u (large)
// - Kategori seçimi (dropdown)
// - Öncelik seçimi (radio buttons)
// - İçerik textarea (rich text editor)
// - Anonim olma seçeneği (checkbox)
// - Anonim ise: ad, email, telefon alanları
// - Etiket ekleme (tag input)
// - İptal ve Gönder butonları
```

### FeedbackDetail
```typescript
interface FeedbackDetailProps {
  feedback: FeedbackSuggestion;
  responses: FeedbackResponse[];
  onAddResponse: (response: string) => Promise<void>;
  onVote: (voteType: 'up' | 'down') => void;
  canRespond: boolean;
  canEdit: boolean;
}

// Görsel Tasarım:
// - Üst kısım: başlık, kategori, öncelik, durum
// - Orta kısım: detaylı içerik
// - Alt kısım: yanıtlar (timeline formatında)
// - Yanıt ekleme formu (yetkiliyse)
// - Oylama butonları
// - İstatistikler (görüntülenme, oy sayıları)
```

### FeedbackFilters
```typescript
interface FeedbackFiltersProps {
  categories: FeedbackCategory[];
  filters: FeedbackFilters;
  onFiltersChange: (filters: FeedbackFilters) => void;
}

// Görsel Tasarım:
// - Kategori filtresi (multi-select)
// - Durum filtresi (dropdown)
// - Öncelik filtresi (radio buttons)
// - Tarih aralığı (date picker)
// - Arama kutusu
// - Filtreleri temizle butonu
```

## 2. Şikayet Yönetimi CRM Bileşenleri

### ComplaintDashboard
```typescript
interface ComplaintDashboardProps {
  stats: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    overdue: number;
  };
  recentComplaints: Complaint[];
  charts: {
    byCategory: ChartData;
    byPriority: ChartData;
    byStatus: ChartData;
    resolutionTime: ChartData;
  };
}

// Görsel Tasarım:
// - Üst kısımda istatistik kartları (4'lü grid)
// - Orta kısımda chart'lar (2x2 grid)
// - Alt kısımda son şikayetler tablosu
// - Hızlı aksiyon butonları (yeni şikayet, atamalar)
```

### ComplaintList
```typescript
interface ComplaintListProps {
  complaints: Complaint[];
  loading: boolean;
  onAssign: (complaintId: string, userId: string) => void;
  onUpdateStatus: (complaintId: string, status: ComplaintStatus) => void;
  onViewDetails: (complaint: Complaint) => void;
  currentUserRole: UserRole;
}

// Görsel Tasarım:
// - Tablo formatında liste
// - Sütunlar: şikayet no, başlık, müşteri, kategori, öncelik, durum, atanan kişi, tarih
// - Renkli öncelik ve durum göstergeleri
// - Satır içi aksiyon butonları
// - Toplu işlemler için checkbox'lar
```

### ComplaintCard
```typescript
interface ComplaintCardProps {
  complaint: Complaint;
  showActions?: boolean;
  onAssign?: () => void;
  onUpdateStatus?: () => void;
  onViewDetails: () => void;
  compact?: boolean;
}

// Görsel Tasarım:
// - Şikayet numarası ve başlık
// - Müşteri bilgileri
// - Kategori ve öncelik
// - Durum ve son güncelleme tarihi
// - Atama bilgisi
// - SLA durumu (overdaysa kırmızı uyarı)
```

### ComplaintForm
```typescript
interface ComplaintFormProps {
  categories: ComplaintCategory[];
  facilities: Facility[];
  onSubmit: (data: ComplaintFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<ComplaintFormData>;
}

// Görsel Tasarım:
// - Çok adımlı form (wizard)
// - Adım 1: Müşteri bilgileri
// - Adım 2: Şikayet detayları
// - Adım 3: Kategori ve öncelik
// - Adım 4: Konum ve ek bilgiler
// - İlerleme göstergesi
// - Her adımda ileri/geri butonları
```

### ComplaintDetail
```typescript
interface ComplaintDetailProps {
  complaint: Complaint;
  responses: ComplaintResponse[];
  assignments: ComplaintAssignment[];
  survey?: ComplaintSatisfactionSurvey;
  onAddResponse: (response: string, type: string) => Promise<void>;
  onAssign: (userId: string, notes?: string) => Promise<void>;
  onUpdateStatus: (status: ComplaintStatus) => Promise<void>;
  canEdit: boolean;
}

// Görsel Tasarım:
// - Üst kısım: şikayet bilgileri (kart formatında)
// - Sol tarafta: zaman çizelgesi (responses, assignments)
// - Sağ tarafta: aksiyon paneli (atama, durum güncelleme)
// - Alt kısım: müşteri memnuniyet anketi
// - Doküman yükleme/dosya yönetimi
```

### AssignmentModal
```typescript
interface AssignmentModalProps {
  complaint: Complaint;
  users: User[];
  onAssign: (userId: string, notes?: string) => Promise<void>;
  onCancel: () => void;
}

// Görsel Tasarım:
// - Kullanıcı listesi (searchable)
// - Kullanıcı kartları (isim, rol, departman)
// - Not alanı (opsiyonel)
// - Atama geçmişi (varsa)
// - Atama butonu
```

## 3. Eğitim Yönetim Sistemi Bileşenleri

### TrainingCalendar
```typescript
interface TrainingCalendarProps {
  sessions: TrainingSession[];
  onSessionClick: (session: TrainingSession) => void;
  onDateSelect: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

// Görsel Tasarım:
// - Takvim görünümü (month/week/day)
// - Eğitim oturumları renkli bloklar
// - Hover'da oturum özeti (tooltip)
// - Filtreleme (kategori, eğitmen, tür)
// - Legend (renk açıklamaları)
```

### TrainingList
```typescript
interface TrainingListProps {
  sessions: TrainingSession[];
  loading: boolean;
  onRegister: (sessionId: string) => void;
  onViewDetails: (session: TrainingSession) => void;
  onCancelRegistration: (sessionId: string) => void;
  currentUserRole: UserRole;
  currentUserId: string;
}

// Görsel Tasarım:
// - Kart formatında liste
// - Her kart: başlık, tarih, eğitmen, lokasyon, katılımcı sayısı
// - Durum göstergesi (kayıt açık/dolu/tamamlandı)
// - Kayıt/Katılım butonları
// - Etiketler (kategori, tür)
```

### TrainingCard
```typescript
interface TrainingCardProps {
  session: TrainingSession;
  showActions?: boolean;
  onRegister?: () => void;
  onViewDetails: () => void;
  onCancelRegistration?: () => void;
  compact?: boolean;
}

// Görsel Tasarım:
// - Başlık ve kategori
// - Tarih ve saat bilgisi
// - Eğitmen bilgisi
// - Lokasyon (online/yüz yüze)
// - Katılımcı durumu (x/max)
// - Kayıt durumu ve butonları
```

### TrainingProgramForm
```typescript
interface TrainingProgramFormProps {
  categories: TrainingCategory[];
  onSubmit: (data: TrainingProgramFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<TrainingProgramFormData>;
}

// Görsel Tasarım:
// - Sekmeli form (bilgiler, materyaller, quiz)
// - Program bilgileri sekmesi
// - Materyal yükleme sekmesi
// - Quiz oluşturma sekmesi
// - Önizleme sekmesi
```

### TrainingSessionForm
```typescript
interface TrainingSessionFormProps {
  programs: TrainingProgram[];
  instructors: User[];
  facilities: Facility[];
  onSubmit: (data: TrainingSessionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<TrainingSessionFormData>;
}

// Görsel Tasarım:
// - Program seçimi
// - Oturum bilgileri
// - Tarih/saat seçiciler
// - Lokasyon bilgileri
// - Eğitmen atama
// - Katılımcı limiti
```

### ParticipantList
```typescript
interface ParticipantListProps {
  participants: TrainingParticipant[];
  sessionId: string;
  onUpdateAttendance: (participantId: string, status: AttendanceStatus) => Promise<void>;
  onUpdateScore: (participantId: string, score: number) => Promise<void>;
  onIssueCertificate: (participantId: string) => Promise<void>;
  canEdit: boolean;
}

// Görsel Tasarım:
// - Tablo formatında katılımcı listesi
// - Sütunlar: katılımcı, kayıt durumu, katılım durumu, skor, sertifika
// - Toplu işlemler (katılım güncelleme)
// - Sertifika indirme butonları
// - Not ekleme alanı
```

### TrainingMaterialViewer
```typescript
interface TrainingMaterialViewerProps {
  materials: TrainingMaterial[];
  onMaterialComplete: (materialId: string) => void;
  progress: Record<string, boolean>;
}

// Görsel Tasarım:
// - Sol tarafta materyal listesi
// - Sağ tarafta materyal görüntüleyici
// - İlerleme göstergesi
// - İndirme butonları
// - Tamamlama butonları
```

### QuizInterface
```typescript
interface QuizInterfaceProps {
  quiz: TrainingQuiz;
  attempt?: TrainingQuizAttempt;
  onStart: () => void;
  onSubmit: (answers: any) => Promise<void>;
  timeRemaining?: number;
}

// Görsel Tasarım:
// - Quiz bilgileri (süre, soru sayısı)
// - Soru görüntüleyici
// - Cevap seçenekleri
// - İlerleme göstergesi
// - Geri/İleri butonları
// - Süre sayacı
// - Gönder butonu
```

## 4. Ortak Bileşenler

### StatusBadge
```typescript
interface StatusBadgeProps {
  status: string;
  type: 'feedback' | 'complaint' | 'training';
  size?: 'small' | 'medium' | 'large';
}

// Renk şeması:
// Feedback: yeni(yeşil), inceleniyor(mavi), beklemedi(sarı), çözüldü(gri), kapatıldı(kırmızı)
// Complaint: yeni(yeşil), atanmayi_bekleyen(sarı), inceleniyor(mavi), çözüm_sürecinde(mor), çözüldü(gri), kapatıldı(kırmızı)
// Training: planlandı(gri), kayıt_açık(yeşil), dolu(sarı), başladı(mavi), tamamlandı(gri), iptal(kırmızı)
```

### PriorityIndicator
```typescript
interface PriorityIndicatorProps {
  priority: Priority | ComplaintPriority;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Renk şeması:
// düşük(gri), orta(mavi), yüksek(turuncu), kritik(kırmızı), acil(kırmızı + animasyon)
```

### Timeline
```typescript
interface TimelineProps {
  items: {
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    user?: string;
  }[];
}

// Görsel Tasarım:
// - Dikey zaman çizelgesi
// - Renkli noktalar ve bağlantı çizgileri
// - Timestamp'lar
// - Kullanıcı bilgileri
```

### FilterPanel
```typescript
interface FilterPanelProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
  children: React.ReactNode;
}

// Görsel Tasarım:
// - Collapsible panel
// - Filtre başlıkları
// - Uygula/Sıfırla butonları
// - Aktif filtre göstergeleri
```

### StatsCard
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

// Görsel Tasarım:
// - Kart formatında
// - İkon ve başlık
// - Büyük değer göstergesi
// - Trend göstergesi (varsa)
// - Hover efektleri
```

### QuickActions
```typescript
interface QuickActionsProps {
  actions: {
    id: string;
    label: string;
    icon: string;
    color: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

// Görsel Tasarım:
// - Grid layout (2x2, 3x2, etc.)
// - İkonlu butonlar
// - Hover efektleri
// - Loading durumları
```

## 5. Mobil Uyumlu Tasarım

### Responsive Breakpoints
```css
/* Mobile: 320px - 768px */
/* Tablet: 768px - 1024px */
/* Desktop: 1024px+ */

/* Mobile adaptations:
- Kartlar full width
- Tablolar horizontal scroll
- Filtreler collapsible
- Butonlar larger touch targets
- Font sizes adjusted
- Simplified navigation
*/
```

### Mobile Components
```typescript
// Mobile-specific components:
- MobileCardList
- MobileTable
- MobileFilters
- MobileNavigation
- SwipeActions
```

## 6. Tema ve Stil Kılavuzu

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;
```

### Typography
```css
/* Font Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

### Shadows
```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

## 7. Animasyon ve Geçişler

### Transitions
```css
/* Standard transitions */
--transition-fast: 150ms ease-in-out;
--transition-normal: 300ms ease-in-out;
--transition-slow: 500ms ease-in-out;

/* Hover effects */
--hover-lift: translateY(-2px);
--hover-scale: scale(1.02);
```

### Loading States
```css
/* Loading animations */
--spin: animation: spin 1s linear infinite;
--pulse: animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
--bounce: animation: bounce 1s infinite;
```

### Micro-interactions
```css
/* Button hover */
button:hover {
  transform: var(--hover-lift);
  box-shadow: var(--shadow-md);
}

/* Card hover */
.card:hover {
  transform: var(--hover-scale);
  box-shadow: var(--shadow-lg);
}

/* Focus states */
.focus-ring:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

## 8. Erişilebilirlik (Accessibility)

### ARIA Labels
```typescript
// Semantic HTML and ARIA labels
<button aria-label="Şikayeti atamak için tıklayın">
  <i className="bi bi-person-plus"></i>
</button>

<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Keyboard Navigation
```css
/* Focus styles */
.focus-visible:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Color Contrast
```css
/* Ensure WCAG AA compliance */
.text-primary {
  color: var(--gray-900); /* 7:1 contrast ratio */
}

.text-secondary {
  color: var(--gray-600); /* 4.5:1 contrast ratio */
}
```

Bu UI/UX tasarım kılavuzu, tutarlı ve erişilebilir bir kullanıcı deneyimi sağlamak için kullanılacaktır. Tüm bileşenler mevcut tasarım diline uyumlu şekilde geliştirilecektir.