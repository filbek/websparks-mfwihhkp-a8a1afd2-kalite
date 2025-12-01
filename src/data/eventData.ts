import { EventClassification, EventLocation, EventType } from '../types/events';

export const eventClassifications: EventClassification[] = [
  {
    id: 'hasta_guvenlik',
    class_name: 'Hasta Güvenliği',
    main_categories: [
      {
        id: 'bina_yapisi',
        name: 'Bina Yapısı ile İlişkili Hatalar',
        sub_categories: [
          { id: 'zemin_kaygan', name: 'Kaygan Zemin' },
          { id: 'aydinlatma', name: 'Yetersiz Aydınlatma' },
          { id: 'giris_cikis', name: 'Giriş/Çıkış Engelleri' },
          { id: 'merdiven_korkuluk', name: 'Merdiven/Korkuluk Sorunları' },
          { id: 'diger_bina', name: 'Diğer Bina Yapısı Hataları' }
        ]
      },
      {
        id: 'cihaz_ekipman',
        name: 'Cihaz/Ekipman/Sistem Kaynaklı Hatalar',
        sub_categories: [
          { id: 'cihaz_arizasi', name: 'Cihaz Arızası' },
          { id: 'bakimsiz_ekipman', name: 'Bakımsız Ekipman' },
          { id: 'yanlis_kullanim', name: 'Yanlış Kullanım' },
          { id: 'sistem_hatasi', name: 'Sistem Hatası' },
          { id: 'diger_ekipman', name: 'Diğer Ekipman Hataları' }
        ]
      },
      {
        id: 'tibbi_kayit',
        name: 'Tıbbi Kayıt ve Klinik Değerlendirme Hataları',
        sub_categories: [
          { id: 'eksik_kayit', name: 'Eksik Kayıt' },
          { id: 'yanlis_kayit', name: 'Yanlış Kayıt' },
          { id: 'gec_kayit', name: 'Geç Kayıt' },
          { id: 'yanlis_degerlenime', name: 'Yanlış Klinik Değerlendirme' },
          { id: 'diger_kayit', name: 'Diğer Kayıt Hataları' }
        ]
      },
      {
        id: 'iletisim',
        name: 'İletişim Hataları',
        sub_categories: [
          { id: 'ekip_iletisim', name: 'Ekip İçi İletişim Eksikliği' },
          { id: 'hasta_iletisim', name: 'Hasta ile İletişim Sorunu' },
          { id: 'devir_teslim', name: 'Devir Teslim Hatası' },
          { id: 'bilgi_akisi', name: 'Bilgi Akış Eksikliği' },
          { id: 'diger_iletisim', name: 'Diğer İletişim Hataları' }
        ]
      },
      {
        id: 'bakim_teshis_tedavi',
        name: 'Bakım, Teşhis ve Tedavi Sürecine İlişkin Hatalar',
        sub_categories: [
          { id: 'ilac_hata', name: 'İlaç Uygulama Hatası' },
          { id: 'hasta_dusme', name: 'Hasta Düşmesi' },
          { id: 'yanlis_teshis', name: 'Yanlış Teşhis' },
          { id: 'geciken_mudahale', name: 'Geciken Müdahale' },
          { id: 'enfeksiyon', name: 'Enfeksiyon Gelişimi' },
          { id: 'diger_tedavi', name: 'Diğer Tedavi Hataları' }
        ]
      },
      {
        id: 'hasta_refakatci',
        name: 'Hasta/Refakatçi Kaynaklı Hatalar',
        sub_categories: [
          { id: 'talimat_uymama', name: 'Talimatlara Uymama' },
          { id: 'bilgi_vermeme', name: 'Bilgi Vermeme/Gizleme' },
          { id: 'siddet', name: 'Şiddet/Saldırgan Davranış' },
          { id: 'kendi_tedavi', name: 'Kendi Tedavisini Kesme' },
          { id: 'diger_hasta', name: 'Diğer Hasta Kaynaklı' }
        ]
      },
      {
        id: 'kan_transfuzyonu',
        name: 'Kan ve Kan Ürünlerinin Transfüzyonuna İlişkin Hatalar',
        sub_categories: [
          { id: 'yanlis_kan', name: 'Yanlış Kan Grubu' },
          { id: 'yanlis_hasta_kan', name: 'Yanlış Hastaya Kan Verilmesi' },
          { id: 'reaksiyon', name: 'Transfüzyon Reaksiyonu' },
          { id: 'saklama_hatasi', name: 'Saklama Koşulları Hatası' },
          { id: 'diger_transfuzyon', name: 'Diğer Transfüzyon Hataları' }
        ]
      },
      {
        id: 'nutrisyon',
        name: 'Nütrisyona İlişkin Hatalar',
        sub_categories: [
          { id: 'yanlis_diyet', name: 'Yanlış Diyet Uygulaması' },
          { id: 'alerjik_besin', name: 'Alerjik Besin Verilmesi' },
          { id: 'aspirasyon', name: 'Aspirasyon Riski' },
          { id: 'yetersiz_beslenme', name: 'Yetersiz Beslenme' },
          { id: 'diger_nutrisyon', name: 'Diğer Nütrisyon Hataları' }
        ]
      }
    ]
  },
  {
    id: 'calisan_guvenlik',
    class_name: 'Çalışan Güvenliği',
    main_categories: [
      {
        id: 'biyolojik_maruziyet',
        name: 'Biyolojik Maruziyet',
        sub_categories: [
          { id: 'igne_batmasi', name: 'İğne Batması' },
          { id: 'kesici_delici_alet', name: 'Kesici/Delici Alet Yaralanması' },
          { id: 'kan_vucut_sivisi', name: 'Kan/Vücut Sıvısı Teması' },
          { id: 'enfeksiyoz_hasta', name: 'Enfeksiyöz Hasta Teması' },
          { id: 'diger_biyolojik', name: 'Diğer Biyolojik Maruziyet' }
        ]
      },
      {
        id: 'kimyasal_maruziyet',
        name: 'Kimyasal Maruziyet',
        sub_categories: [
          { id: 'dezenfektan', name: 'Dezenfektan Maruziyeti' },
          { id: 'ilac_kimyasal', name: 'İlaç Kimyasalları Maruziyeti' },
          { id: 'temizlik_kimyasal', name: 'Temizlik Kimyasalları' },
          { id: 'laboratuvar_kimyasal', name: 'Laboratuvar Kimyasalları' },
          { id: 'diger_kimyasal', name: 'Diğer Kimyasal Maruziyet' }
        ]
      },
      {
        id: 'radyasyon_maruziyet',
        name: 'Radyasyon Maruziyeti',
        sub_categories: [
          { id: 'xray_maruziyet', name: 'X-Ray Maruziyeti' },
          { id: 'ct_maruziyet', name: 'CT Maruziyeti' },
          { id: 'radyoterapi', name: 'Radyoterapi Maruziyeti' },
          { id: 'nükleer_tip', name: 'Nükleer Tıp Maruziyeti' },
          { id: 'diger_radyasyon', name: 'Diğer Radyasyon Maruziyeti' }
        ]
      },
      {
        id: 'is_kazasi',
        name: 'İş Kazaları',
        sub_categories: [
          { id: 'dusme_kayma', name: 'Düşme/Kayma' },
          { id: 'carpma_carpilma', name: 'Çarpma/Çarpılma' },
          { id: 'yanma_yakma', name: 'Yanma/Yakma' },
          { id: 'elektrik_carpma', name: 'Elektrik Çarpması' },
          { id: 'diger_kaza', name: 'Diğer İş Kazaları' }
        ]
      },
      {
        id: 'siddet',
        name: 'Şiddet Olayları',
        sub_categories: [
          { id: 'fiziksel_siddet', name: 'Fiziksel Şiddet' },
          { id: 'sozel_siddet', name: 'Sözel Şiddet' },
          { id: 'psikolojik_siddet', name: 'Psikolojik Şiddet/Mobbing' },
          { id: 'cinsel_taciz', name: 'Cinsel Taciz' },
          { id: 'diger_siddet', name: 'Diğer Şiddet Olayları' }
        ]
      },
      {
        id: 'ergonomik_risk',
        name: 'Ergonomik Riskler',
        sub_categories: [
          { id: 'agir_yuk', name: 'Ağır Yük Kaldırma' },
          { id: 'yanlis_pozisyon', name: 'Yanlış Vücut Pozisyonu' },
          { id: 'tekrarli_hareket', name: 'Tekrarlı Hareketler' },
          { id: 'uzun_ayakta', name: 'Uzun Süre Ayakta Durma' },
          { id: 'diger_ergonomik', name: 'Diğer Ergonomik Riskler' }
        ]
      },
      {
        id: 'psikososyal_risk',
        name: 'Psikososyal Riskler',
        sub_categories: [
          { id: 'is_stresi', name: 'İş Stresi' },
          { id: 'tukenmislik', name: 'Tükenmişlik Sendromu' },
          { id: 'uzun_calisma', name: 'Uzun Çalışma Saatleri' },
          { id: 'gece_vardiya', name: 'Gece Vardiyası Etkileri' },
          { id: 'diger_psikososyal', name: 'Diğer Psikososyal Riskler' }
        ]
      },
      {
        id: 'diger_guvenlik',
        name: 'Diğer Güvenlik Riskleri',
        sub_categories: [
          { id: 'hijyen_sorunu', name: 'Hijyen Sorunları' },
          { id: 'koruyucu_eksik', name: 'Koruyucu Ekipman Eksikliği' },
          { id: 'egitim_eksik', name: 'Eğitim Eksikliği' },
          { id: 'bakim_eksik', name: 'Ekipman Bakım Eksikliği' },
          { id: 'diger_risk', name: 'Diğer Riskler' }
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
  { id: 'klinik', name: 'Klinik' },
  { id: 'acil_servis', name: 'Acil Servis' },
  { id: 'poliklinik', name: 'Poliklinik' },
  { id: 'ameliyathane', name: 'Ameliyathane' },
  { id: 'eczane', name: 'Eczane' },
  { id: 'laboratuvar', name: 'Laboratuvar' },
  { id: 'kan_alma_birimi', name: 'Kan Alma Birimi' },
  { id: 'tibbi_goruntuleme_birimi', name: 'Tıbbi Görüntüleme Birimi' },
  { id: 'kisisel_hijyen_alanlari', name: 'Kişisel Hijyen Alanları' },
  { id: 'tesis_bahcesi', name: 'Tesis Bahçesi' },
  { id: 'otopark', name: 'Otopark' },
  { id: 'teknik_birim', name: 'Teknik Birim' },
  { id: 'acil_saglik_ambulans', name: 'Acil Sağlık Hizmetleri (Ambulans)' },
  { id: 'acil_saglik_olay_yeri', name: 'Acil Sağlık Hizmetleri (Olay Yeri)' },
  { id: 'kisisel_temizlik_alani', name: 'Kişisel Temizlik Alanı (Banyo, Tuvalet vb.)' },
  { id: 'yogun_bakim_unitesi', name: 'Yoğun Bakım Ünitesi' }
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
  { id: 'uzman_hekim', name: 'Uzman Hekim' },
  { id: 'pratisyen_hekim', name: 'Pratisyen Hekim' },
  { id: 'dis_tabibi', name: 'Diş Tabibi' },
  { id: 'eczaci', name: 'Eczacı' },
  { id: 'hemsire', name: 'Hemşire' },
  { id: 'eczane_teknisyeni', name: 'Eczane Teknisyeni' },
  { id: 'acil_tip_teknisyeni', name: 'Acil Tıp Teknisyeni/Teknikeri' },
  { id: 'asistan', name: 'Asistan' },
  { id: 'stajyer', name: 'Stajyer' },
  { id: 'hasta', name: 'Hasta' },
  { id: 'hasta_yakini', name: 'Hasta Yakını' },
  { id: 'kisiden_kaynaklanmayan', name: 'Kişiden Kaynaklanmayan Hata/Diğer' }
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

export const facilityLocations = [
  { id: 'ozel_hastane', name: 'Özel-Hastane' },
  { id: 'genel_hastane', name: 'Genel Hastane' },
  { id: 'egitim_arastirma', name: 'Eğitim ve Araştırma Hastanesi' },
  { id: 'universite', name: 'Üniversite Hastanesi' },
  { id: 'devlet_hastanesi', name: 'Devlet Hastanesi' }
];

export const facilitySubLocations = [
  { id: 'acil_servis', name: 'Acil Servis', parent: 'all' },
  { id: 'poliklinik', name: 'Poliklinik', parent: 'all' },
  { id: 'klinik', name: 'Klinik', parent: 'all' },
  { id: 'ameliyathane', name: 'Ameliyathane', parent: 'all' },
  { id: 'yogun_bakim', name: 'Yoğun Bakım Ünitesi', parent: 'all' },
  { id: 'laboratuvar', name: 'Laboratuvar', parent: 'all' },
  { id: 'radyoloji', name: 'Radyoloji', parent: 'all' },
  { id: 'eczane', name: 'Eczane', parent: 'all' },
  { id: 'idari_birim', name: 'İdari Birim', parent: 'all' },
  { id: 'teknik_servis', name: 'Teknik Servis', parent: 'all' }
];

export const employeeSafetyClasses = [
  { id: 'biyolojik_maruziyet', name: 'Biyolojik Maruziyet' },
  { id: 'kimyasal_maruziyet', name: 'Kimyasal Maruziyet' },
  { id: 'radyasyon_maruziyet', name: 'Radyasyon Maruziyeti' },
  { id: 'enfeksiyoz_atkene_cilt_teması', name: 'Enfeksiyöz Etkene Cilt Teması' },
  { id: 'biyolojik_maruziyet_hastaliklar', name: 'Biyolojik Maruziyet (Hastalıklar)' }
];

export const primaryCauseDetails = [
  { id: 'batma_kesme', name: 'Batma, Kesme', parent: 'is_kazasi' },
  { id: 'carpma_carpilma', name: 'Çarpma, Çarpılma', parent: 'is_kazasi' },
  { id: 'dusme_kayma', name: 'Düşme, Kayma', parent: 'is_kazasi' },
  { id: 'siddet_fiziksel', name: 'Fiziksel Şiddet', parent: 'siddet' },
  { id: 'siddet_sozel', name: 'Sözel Şiddet', parent: 'siddet' },
  { id: 'siddet_psikolojik', name: 'Psikolojik Şiddet', parent: 'siddet' }
];
