import { EventClassification, EventLocation, EventType } from '../types/events';

export const eventClassifications: EventClassification[] = [
  {
    id: 'hasta_guvenlik',
    class_name: 'Hasta Güvenliği',
    main_categories: [
      {
        id: 'hasta_dusme',
        name: 'Hasta Düşmesi',
        sub_categories: [
          { id: 'yatak_dusme', name: 'Yataktan Düşme' },
          { id: 'banyo_dusme', name: 'Banyoda Düşme' },
          { id: 'koridor_dusme', name: 'Koridorda Düşme' }
        ]
      },
      {
        id: 'ilac_hata',
        name: 'İlaç Hatası',
        sub_categories: [
          { id: 'yanlis_doz', name: 'Yanlış Doz' },
          { id: 'yanlis_ilac', name: 'Yanlış İlaç' },
          { id: 'yanlis_hasta', name: 'Yanlış Hasta' }
        ]
      },
      {
        id: 'enfeksiyon',
        name: 'Enfeksiyon Kontrolü',
        sub_categories: [
          { id: 'el_hijyen', name: 'El Hijyeni Eksikliği' },
          { id: 'izolasyon', name: 'İzolasyon Kuralları' },
          { id: 'sterilizasyon', name: 'Sterilizasyon Hatası' }
        ]
      }
    ]
  },
  {
    id: 'calisan_guvenlik',
    class_name: 'Çalışan Güvenliği',
    main_categories: [
      {
        id: 'is_kazasi',
        name: 'İş Kazası',
        sub_categories: [
          { id: 'kesici_alet', name: 'Kesici Alet Yaralanması' },
          { id: 'kimyasal', name: 'Kimyasal Maruziyeti' },
          { id: 'radyasyon', name: 'Radyasyon Maruziyeti' }
        ]
      },
      {
        id: 'siddet',
        name: 'Şiddet Olayları',
        sub_categories: [
          { id: 'hasta_siddet', name: 'Hasta Şiddeti' },
          { id: 'yakinlar_siddet', name: 'Hasta Yakınları Şiddeti' },
          { id: 'sozel_siddet', name: 'Sözel Şiddet' }
        ]
      }
    ]
  },
  {
    id: 'acil_durum',
    class_name: 'Acil Durum',
    main_categories: [
      {
        id: 'yangin',
        name: 'Yangın',
        sub_categories: [
          { id: 'elektrik_yangin', name: 'Elektrik Yangını' },
          { id: 'kimyasal_yangin', name: 'Kimyasal Yangın' }
        ]
      },
      {
        id: 'dogal_afet',
        name: 'Doğal Afet',
        sub_categories: [
          { id: 'deprem', name: 'Deprem' },
          { id: 'sel', name: 'Sel' }
        ]
      }
    ]
  }
];

export const eventLocations: EventLocation[] = [
  { id: 'acil_servis', name: 'Acil Servis' },
  { id: 'yogun_bakim', name: 'Yoğun Bakım' },
  { id: 'ameliyathane', name: 'Ameliyathane' },
  { id: 'hasta_odasi', name: 'Hasta Odası' },
  { id: 'koridor', name: 'Koridor' },
  { id: 'banyo', name: 'Banyo' },
  { id: 'laboratuvar', name: 'Laboratuvar' },
  { id: 'radyoloji', name: 'Radyoloji' },
  { id: 'eczane', name: 'Eczane' },
  { id: 'kafeterya', name: 'Kafeterya' }
];

export const eventTypes: EventType[] = [
  { id: 'ramak_kala', name: 'Ramak Kala' },
  { id: 'zarar_yok', name: 'Zarar Yok' },
  { id: 'hafif_zarar', name: 'Hafif Zarar' },
  { id: 'orta_zarar', name: 'Orta Zarar' },
  { id: 'ciddi_zarar', name: 'Ciddi Zarar' },
  { id: 'olum', name: 'Ölüm' }
];

export const departments = [
  { id: 'acil_servis', name: 'Acil Servis' },
  { id: 'dahiliye', name: 'Dahiliye' },
  { id: 'cerrahi', name: 'Cerrahi' },
  { id: 'pediatri', name: 'Pediatri' },
  { id: 'kadin_dogum', name: 'Kadın Doğum' },
  { id: 'anestezi', name: 'Anestezi' },
  { id: 'radyoloji', name: 'Radyoloji' },
  { id: 'laboratuvar', name: 'Laboratuvar' }
];

export const jobTitles = [
  { id: 'doktor', name: 'Doktor' },
  { id: 'hemsire', name: 'Hemşire' },
  { id: 'tekniker', name: 'Tekniker' },
  { id: 'temizlik', name: 'Temizlik Personeli' },
  { id: 'guvenlik', name: 'Güvenlik' },
  { id: 'idari', name: 'İdari Personel' }
];

export const damageStatuses = [
  { id: 'yaralanma_yok', name: 'Yaralanma Yok' },
  { id: 'hafif', name: 'Hafif Yaralanma' },
  { id: 'orta', name: 'Orta Yaralanma' },
  { id: 'ciddi', name: 'Ciddi Yaralanma' },
  { id: 'olum', name: 'Ölüm' }
];

export const impactDurations = [
  { id: 'anlik', name: 'Anlık' },
  { id: 'kisa', name: 'Kısa Süreli (1-7 gün)' },
  { id: 'orta', name: 'Orta Süreli (1-4 hafta)' },
  { id: 'uzun', name: 'Uzun Süreli (1 ay+)' }
];
