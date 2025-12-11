import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DOF } from '../../types';
import { useDofLocations } from '../../hooks/useDofLocations';
import { useAuth } from '../../contexts/AuthContext';

interface DOFWizardProps {
  onSubmit: (data: Partial<DOF>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Temel Bilgiler', description: 'DÖF tespit tarihi ve türü', icon: 'bi-calendar-check' },
  { id: 2, title: 'Kaynak ve Kategori', description: 'DÖF kaynağı ve kategorisi', icon: 'bi-tags' },
  { id: 3, title: 'Sorumluluk', description: 'Sorumlu bölüm ve kişi', icon: 'bi-person-check' },
  { id: 4, title: 'Detaylar', description: 'Açıklama ve dosyalar', icon: 'bi-file-text' },
  { id: 5, title: 'Onay', description: 'Bilgileri kontrol et', icon: 'bi-check-circle' }
];

// Güncellenmiş DÖF Kaynağı seçenekleri
const dofKaynagiOptions = [
  { value: '', label: 'Kaynak Seçiniz' },
  { value: 'oz_degerlendirme_uygunsuslugu', label: 'Öz Değerlendirme Uygunsuzluğu' },
  { value: 'urun_hizmet_surec_uygunsuslugu', label: 'Ürün / Hizmet / Süreç Uygunsuzluğu' },
  { value: 'veri_analiz_sonuclari', label: 'Veri Analiz Sonuçları' },
  { value: 'olay_bildirimleri', label: 'Olay Bildirimleri' },
  { value: 'musteri_sikayeti', label: 'Müşteri Şikayeti' },
  { value: 'saha_denetim_uygunsuslugu', label: 'Saha Denetim Uygunsuzluğu' },
  { value: 'bina_tesis_turu_uygunsuslugu', label: 'Bina Tesis Turu Uygunsuzluğu' }
];

// Kategoriye göre kısa açıklama seçenekleri - Güncellenmiş tam liste
const getKisaAciklamaOptions = (kategori: string) => {
  const baseOption = { value: '', label: 'Seçim yapınız' };

  switch (kategori) {
    case 'atik_yonetimi':
      return [
        baseOption,
        { value: 'atik_konteynerinin_kapisi_kilitli_olmamasi', label: 'Atık konteynerının kapısının kilitli olmaması' },
        { value: 'atik_kovalarinin_uygun_atik_koduna_gore_etiketlenmemesi', label: 'Atık kovalarının uygun atık koduna göre etiketlenmemesi' },
        { value: 'atik_kovasinin_kapaginin_acik_olmasi', label: 'Atık kovasının kapağının açık olması' },
        { value: 'atik_kutularinin_uzerinde_uluslararasi_uyari_isaretlerinin_bulunmamasi', label: 'Atık kutularının üzerinde uluslararası uyarı işaretlerinin bulunmaması' },
        { value: 'atik_posetlerinin_hangi_birimden_toplandigi_belirtilmemesi', label: 'Atık poşetlerinin hangi birimden toplandığının belirtilmemesi' },
        { value: 'atik_sahasinda_farkli_atiklarin_karismasi', label: 'Atık sahasında farklı atıkların karışması' },
        { value: 'atik_sahasinda_karisik_depolama_yapilmasi', label: 'Atık sahasında karışık depolama yapılması' },
        { value: 'atik_sahasinin_guvenlik_onlemlerinin_yetersiz_olmasi', label: 'Atık sahasının güvenlik önlemlerinin yetersiz olması' },
        { value: 'atik_sahasinin_kilitli_olmamasi', label: 'Atık sahasının kilitli olmaması' },
        { value: 'atik_sahasinin_kontrolsuz_sekilde_kullanilmasi', label: 'Atık sahasının kontrolsüz şekilde kullanılması' },
        { value: 'atik_sahasinda_temizlik_yapilmamasi', label: 'Atık sahasında temizlik yapılmaması' },
        { value: 'atik_sahasinin_zemininde_sizinti_veya_kirlenme_olmasi', label: 'Atık sahasının zemininde sızıntı veya kirlenme olması' },
        { value: 'atik_sahasinin_uygun_olmayan_sekilde_etiketlenmesi', label: 'Atık sahasının uygun olmayan şekilde etiketlenmesi' },
        { value: 'atik_sahasinda_yeterli_sayida_uyari_levhasi_bulunmamasi', label: 'Atık sahasında yeterli sayıda uyarı levhası bulunmaması' },
        { value: 'atik_sahasinda_yetkisiz_kisilerin_girisine_izin_verilmesi', label: 'Atık sahasında yetkisiz kişilerin girişine izin verilmesi' },
        { value: 'atik_sahasinda_tibbi_ve_evsel_atiklarin_karismasi', label: 'Atık sahasında tıbbi ve evsel atıkların karışması' },
        { value: 'atik_toplama_noktalarinin_sayisinin_yetersiz_olmasi', label: 'Atık toplama noktalarının sayısının yetersiz olması' },
        { value: 'atik_toplama_suresine_uyulmamasi', label: 'Atık toplama süresine uyulmaması' },
        { value: 'atik_torbalarinin_cift_kat_yapilmamasi', label: 'Atık torbalarının çift kat yapılmaması' },
        { value: 'atik_torbalarinin_tasinma_sirasinda_yirtilmasi_veya_delinmesi', label: 'Atık torbalarının taşınma sırasında yırtılması veya delinmesi' },
        { value: 'atik_torbalarinin_zamaninda_tasinmamasi', label: 'Atık torbalarının zamanında taşınmaması' },
        { value: 'tehlikeli_atiklarin_gecici_depolama_sahasinda_uygun_sekilde_muhafaza_edilmemesi', label: 'Tehlikeli atıkların geçici depolama sahasında uygun şekilde muhafaza edilmemesi' }
      ];

    case 'cihaz_ve_ekipman':
      return [
        baseOption,
        { value: 'ariza_durumunda_cihaz_kullanim_disi_birakilarak_etiketlenmemesi', label: 'Arıza durumunda cihaz kullanım dışı bırakılarak etiketlenmemesi' },
        { value: 'arizali_cihazlarin_onariminin_gecikmesi', label: 'Arızalı cihazların onarımının gecikmesi' },
        { value: 'cihaz_arizasinin_teknik_servise_bildirilmemesi', label: 'Cihaz arızasının teknik servise bildirilmemesi' },
        { value: 'cihaz_bakimlarinin_duzenli_yapilmamasi', label: 'Cihaz bakımlarının düzenli yapılmaması' },
        { value: 'cihazlarin_bulundugu_alanlarda_uygun_havalandirma_olmamasi', label: 'Cihazların bulunduğu alanlarda uygun havalandırma olmaması' },
        { value: 'cihazlarin_kalibrasyon_surelerinin_gecmis_olmasi', label: 'Cihazların kalibrasyon sürelerinin geçmiş olması' },
        { value: 'cihazlarin_kullanimi_hakkinda_personelin_yeterli_egitim_almamis_olmasi', label: 'Cihazların kullanımı hakkında personelin yeterli eğitim almamış olması' },
        { value: 'cihazlarin_periyodik_bakim_kayitlarinin_bulunmamasi', label: 'Cihazların periyodik bakım kayıtlarının bulunmaması' },
        { value: 'cihazlarin_tasinmasi_sirasinda_uygun_koruyucu_onlemlerin_alinmamasi', label: 'Cihazların taşınması sırasında uygun koruyucu önlemlerin alınmaması' },
        { value: 'elektrik_panosunun_kilitli_olmamasi', label: 'Elektrik panosunun kilitli olmaması' },
        { value: 'elektrikli_cihazlarin_topraklama_etiketlerinin_bulunmamasi', label: 'Elektrikli cihazların topraklama etiketlerinin bulunmaması' },
        { value: 'elektrikli_cihazlarin_uygun_olmayan_sekilde_kullanilmasi', label: 'Elektrikli cihazların uygun olmayan şekilde kullanılması' },
        { value: 'ekipman_ve_cihazlarin_calisma_sirasinda_titresim_gurultu_veya_isi_yaymasi', label: 'Ekipman ve cihazların çalışma sırasında titreşim, gürültü veya ısı yayması' },
        { value: 'ekipmanlarin_temizliginin_yapilmamasi', label: 'Ekipmanların temizliğinin yapılmaması' },
        { value: 'ekipmanlarin_uygun_olmayan_sekilde_depolanmasi', label: 'Ekipmanların uygun olmayan şekilde depolanması' },
        { value: 'kalibrasyon_yapilmamis_cihazlarin_kullanilmasi', label: 'Kalibrasyon yapılmamış cihazların kullanılması' },
        { value: 'kalibrasyon_yapilmasi_gereken_cihazlarin_etiketlenmemesi', label: 'Kalibrasyon yapılması gereken cihazların etiketlenmemesi' },
        { value: 'kullanilan_cihazin_performans_testinin_yapilmamasi', label: 'Kullanılan cihazın performans testinin yapılmaması' },
        { value: 'medikal_cihazlarin_kayit_ve_envanter_bilgilerinin_guncel_olmamasi', label: 'Medikal cihazların kayıt ve envanter bilgilerinin güncel olmaması' },
        { value: 'medikal_cihazlarin_kullanim_disi_birakilmasina_ragmen_alandan_kaldirilmamasi', label: 'Medikal cihazların kullanım dışı bırakılmasına rağmen alandan kaldırılmaması' },
        { value: 'medikal_cihazlarin_periyodik_kontrollerinin_yapilmamasi', label: 'Medikal cihazların periyodik kontrollerinin yapılmaması' },
        { value: 'medikal_cihazlarin_periyodik_bakim_planlarinin_olmamasi', label: 'Medikal cihazların periyodik bakım planlarının olmaması' },
        { value: 'medikal_cihazlarin_kullanim_talimatlarinin_gorunur_yerde_bulunmamasi', label: 'Medikal cihazların kullanım talimatlarının görünür yerde bulunmaması' },
        { value: 'medikal_cihazlarin_uygun_olmayan_kosullarda_saklanmasi', label: 'Medikal cihazların uygun olmayan koşullarda saklanması' },
        { value: 'onarimi_yapilan_cihazin_yeniden_calisabilirlik_testinin_yapilmamasi', label: 'Onarımı yapılan cihazın yeniden çalışabilirlik testinin yapılmaması' },
        { value: 'periyodik_bakim_etiketi_bulunmayan_cihazlarin_alanda_kullanilmasi', label: 'Periyodik bakım etiketi bulunmayan cihazların alanda kullanılması' },
        { value: 'portatif_cihazlarin_sabitlenmeden_kullanilmasi', label: 'Portatif cihazların sabitlenmeden kullanılması' },
        { value: 'sedyelerin_tekerlekli_sandalyelerin_fren_sistemlerinin_arizali_olmasi', label: 'Sedyelerin, tekerlekli sandalyelerin fren sistemlerinin arızalı olması' },
        { value: 'su_gaz_elektrik_baglantilarin_gevsek_olmasi', label: 'Su, gaz, elektrik bağlantılarının gevşek olması' },
        { value: 'teknik_ekipmanlarda_yedek_parca_eksikligi', label: 'Teknik ekipmanlarda yedek parça eksikliği' },
        { value: 'teknik_personel_tarafindan_cihaz_arizalarinin_zamaninda_giderilmemesi', label: 'Teknik personel tarafından cihaz arızalarının zamanında giderilmemesi' },
        { value: 'tibbi_cihazlarda_kalibrasyon_sertifikalarinin_bulunmamasi', label: 'Tıbbi cihazlarda kalibrasyon sertifikalarının bulunmaması' },
        { value: 'tibbi_cihazlarin_uygun_olmayan_kosullarda_depolanmasi', label: 'Tıbbi cihazların uygun olmayan koşullarda depolanması' },
        { value: 'uyari_etiketlerinin_silinmis_veya_okunamaz_durumda_olmasi', label: 'Uyarı etiketlerinin silinmiş veya okunamaz durumda olması' }
      ];

    case 'dokuman_yonetimi':
      return [
        baseOption,
        { value: 'adreslemelerinin_yapilmamasi_veya_eksik_yapilmasi', label: 'Adreslemelerinin yapılmaması veya eksik yapılması' },
        { value: 'dokumanlarin_guncel_olmamasi', label: 'Dokümanların güncel olmaması' },
        { value: 'dokumanlarin_imza_onay_surecinin_tamamlanmamasi', label: 'Dokümanların imza onay sürecinin tamamlanmaması' },
        { value: 'dokumanlarin_revizyon_tarihinin_gecmis_olmasi', label: 'Dokümanların revizyon tarihinin geçmiş olması' },
        { value: 'dokumanlarda_imza_eksikligi_olmasi', label: 'Dokümanlarda imza eksikliği olması' },
        { value: 'dokumanlarda_yazim_veya_icerik_hatalarinin_bulunmasi', label: 'Dokümanlarda yazım veya içerik hatalarının bulunması' },
        { value: 'guncel_olmayan_formlarin_kullanimda_olmasi', label: 'Güncel olmayan formların kullanımda olması' },
        { value: 'talimatlarin_erisilebilir_yerlerde_bulunmamasi', label: 'Talimatların erişilebilir yerlerde bulunmaması' },
        { value: 'talimatlarin_iceriginin_personel_tarafindan_bilinmemesi', label: 'Talimatların içeriğinin personel tarafından bilinmemesi' }
      ];

    case 'enfeksiyon_kontrol':
      return [
        baseOption,
        { value: 'bolumde_el_dezenfeksiyonu_icin_kullanilan_malzemenin_bulunmamasi', label: 'Bölümde el dezenfeksiyonu için kullanılan malzemenin bulunmaması' },
        { value: 'el_hijyenine_uyulmamasi', label: 'El hijyenine uyulmaması' },
        { value: 'el_hijyen_istasyonlarinin_uygun_yerlerde_bulunmamasi', label: 'El hijyen istasyonlarının uygun yerlerde bulunmaması' },
        { value: 'el_hijyenine_yonelik_egitimlerin_verilmemesi', label: 'El hijyenine yönelik eğitimlerin verilmemesi' },
        { value: 'enfeksiyon_kontrol_komitesi_talimatlarina_uyulmamasi', label: 'Enfeksiyon kontrol komitesi talimatlarına uyulmaması' },
        { value: 'enfeksiyon_kontrolu_kapsaminda_yuzey_dezenfeksiyonunun_uygun_yapilmamasi', label: 'Enfeksiyon kontrolü kapsamında yüzey dezenfeksiyonunun uygun yapılmaması' },
        { value: 'enfeksiyon_riski_tasiyan_atiklarin_uygun_sekilde_uzaklastirilmamasi', label: 'Enfeksiyon riski taşıyan atıkların uygun şekilde uzaklaştırılmaması' },
        { value: 'hastane_genelinde_sterilizasyon_kayitlarinin_eksik_olmasi', label: 'Hastane genelinde sterilizasyon kayıtlarının eksik olması' },
        { value: 'izolasyon_odalarinin_kurallarina_uyulmamasi', label: 'İzolasyon odalarının kurallarına uyulmaması' },
        { value: 'izolasyon_alanlarinda_uyari_levhalarinin_bulunmamasi', label: 'İzolasyon alanlarında uyarı levhalarının bulunmaması' },
        { value: 'kirli_ve_temiz_alanlarin_ayriminin_net_yapilmamasi', label: 'Kirli ve temiz alanların ayrımının net yapılmaması' },
        { value: 'kullanilmis_malzemelerin_uygun_sekilde_imha_edilmemesi', label: 'Kullanılmış malzemelerin uygun şekilde imha edilmemesi' },
        { value: 'sterilizasyon_sonrasi_malzemelerin_dogru_kosullarda_saklanmamasi', label: 'Sterilizasyon sonrası malzemelerin doğru koşullarda saklanmaması' },
        { value: 'sterilizasyon_kayitlarinin_eksik_tutulmasi', label: 'Sterilizasyon kayıtlarının eksik tutulması' },
        { value: 'steril_malzemelerin_son_kullanma_tarihine_dikkat_edilmemesi', label: 'Steril malzemelerin son kullanma tarihine dikkat edilmemesi' },
        { value: 'tibbi_atik_kutularinin_dolmasina_ragmen_degistirilmemesi', label: 'Tıbbi atık kutularının dolmasına rağmen değiştirilmemesi' },
        { value: 'tibbi_atik_torbalarinin_cift_kat_yapilmamasi', label: 'Tıbbi atık torbalarının çift kat yapılmaması' },
        { value: 'tibbi_cihazlarin_dezenfeksiyonunun_talimatlara_uygun_yapilmamasi', label: 'Tıbbi cihazların dezenfeksiyonunun talimatlara uygun yapılmaması' },
        { value: 'uygun_eldiven_maske_onluk_kullanilmamasi', label: 'Uygun eldiven, maske, önlük kullanılmaması' },
        { value: 'yuzey_temizlik_kayitlarinin_tutulmamasi', label: 'Yüzey temizlik kayıtlarının tutulmaması' },
        { value: 'ziyaretci_kisitlamasi_gereken_alanlarda_kontrollerin_yapilmamasi', label: 'Ziyaretçi kısıtlaması gereken alanlarda kontrollerin yapılmaması' }
      ];

    case 'hasta_guvenligi':
      return [
        baseOption,
        { value: 'acil_durum_aktivasyon_kayitlarinin_olmamasi_eksik_olmasi', label: 'Acil durum aktivasyon kayıtlarının olmaması/eksik olması' },
        { value: 'acil_durum_ekibinin_gec_gelmesi', label: 'Acil durum ekibinin geç gelmesi' },
        { value: 'acil_durum_kodlarinin_bilinmemesi', label: 'Acil durum kodlarının bilinmemesi' },
        { value: 'acil_durum_kodlarinin_uygun_olarak_aktive_edilmemesi', label: 'Acil durum kodlarının uygun olarak aktive edilmemesi' },
        { value: 'acil_mudahale_seti_icinde_bulunan_ilac_ve_malzemelerin_stok_seviyelerindeki_uyumsuzluk_bulunmasi', label: 'Acil müdahale seti içinde bulunan ilaç ve malzemelerin stok seviyelerindeki uyumsuzluk bulunması' },
        { value: 'afet_eylem_planinin_bilinmemesi', label: 'Afet eylem planının bilinmemesi' },
        { value: 'agiz_bakimi_ve_takibi_yetersizligi', label: 'Ağız bakımı ve takibi yetersizliği' },
        { value: 'agri_siddeti_degerlendirmesi_eksikligi', label: 'Ağrı şiddeti değerlendirmesi eksikliği' },
        { value: 'ameliyat_oncesi_hastaya_ait_cikarilabilen_protezlerin_ve_degerli_esyalarin_teslimi_ile_ilgili_sureclerde_eksiklik', label: 'Ameliyat öncesi hastaya ait çıkarılabilen protezlerin ve değerli eşyaların teslimi ile ilgili süreçlerde eksiklik' },
        { value: 'bakim_ihtiyaclarina_yonelik_hedeflerin_belirlenmemis_olmasi', label: 'Bakım ihtiyaçlarına yönelik hedeflerin belirlenmemiş olması' },
        { value: 'bakim_teshis_ve_tedavi_surecine_iliskin_hatalar', label: 'Bakım, teşhis ve tedavi sürecine ilişkin hatalar' },
        { value: 'basi_ulseri_risk_degerlendirmesinin_eksikligi', label: 'Bası ülseri risk değerlendirmesinin eksikliği' },
        { value: 'beslenme_durumunun_degerlendirilmemesi', label: 'Beslenme durumunun değerlendirilmemesi' },
        { value: 'bilgilendirilmis_onam_formunun_eksik_doldurulmasi', label: 'Bilgilendirilmiş onam formunun eksik doldurulması' },
        { value: 'bina_dahilinde_sigara_icilmesi', label: 'Bina dahilinde sigara içilmesi' },
        { value: 'bolume_ozgu_risklerin_tanimlanmamasi', label: 'Bölüme özgü risklerin tanımlanmaması' },
        { value: 'cerrahi_isaretlemenin_yapilmamis_olmasi', label: 'Cerrahi işaretlemenin yapılmamış olması' },
        { value: 'calisanlarin_acil_durum_kodlarinda_mudahale_konusunda_yetersiz_bilgiye_sahip_olmasi', label: 'Çalışanların acil durum kodlarında müdahale konusunda yetersiz bilgiye sahip olması' },
        { value: 'dusme_riski_degerlendirmesinin_yapilmamis_olmasi', label: 'Düşme riski değerlendirmesinin yapılmamış olması' },
        { value: 'eczaneden_yanlis_ilac_gonderimi_olmasi', label: 'Eczaneden yanlış ilaç gönderimi olması' },
        { value: 'ekstremite_nabiz_takibi_ve_odem_derecelendirmesi_eksikligi', label: 'Ekstremite nabız takibi ve ödem derecelendirmesi eksikliği' },
        { value: 'el_hijyeninde_5_endikasyona_uyulmamasi', label: 'El hijyeninde 5 endikasyona uyulmaması' },
        { value: 'glukometrenin_gunluk_kontrolunun_yapilmamasi', label: 'Glukometrenin günlük kontrolünün yapılmaması' },
        { value: 'hasta_bilekligi_takilmadan_yonlendirme_yapilmasi', label: 'Hasta bilekliği takılmadan yönlendirme yapılması' },
        { value: 'hasta_damar_yolu_acilis_bilgilerinin_yazilmamasi', label: 'Hasta damar yolu açılış bilgilerinin yazılmaması' },
        { value: 'hasta_dusme_risk_onlemlerinin_alinmamis_olmasi', label: 'Hasta düşme risk önlemlerinin alınmamış olması' },
        { value: 'hasta_dusmesi', label: 'Hasta düşmesi' },
        { value: 'hasta_guvenligi_hedeflerinin_uygulanmamasi', label: 'Hasta güvenliği hedeflerinin uygulanmaması' },
        { value: 'hasta_kol_bandi_uzerindeki_bilgilerin_hatali_eksik_olmasi', label: 'Hasta kol bandı üzerindeki bilgilerin hatalı/eksik olması' },
        { value: 'hasta_oda_numaralarinin_kimlik_yerine_kullanilmasi', label: 'Hasta oda numaralarının kimlik yerine kullanılması' },
        { value: 'hastada_koter_yanigi_olusmasi', label: 'Hastada koter yanığı oluşması' },
        { value: 'hastaneye_girislerin_kontrol_edilememesi', label: 'Hastaneye girişlerin kontrol edilememesi' },
        { value: 'hastanin_eksik_hazirlikla_ameliyathaneye_teslim_edilmesi', label: 'Hastanın eksik hazırlıkla ameliyathaneye teslim edilmesi' },
        { value: 'hastanin_transferinin_saglik_calisani_esliginde_yapilmamasi', label: 'Hastanın transferinin sağlık çalışanı eşliğinde yapılmaması' },
        { value: 'hastaya_gerekli_bilgilendirmenin_yapilmamasi', label: 'Hastaya gerekli bilgilendirmenin yapılmaması' },
        { value: 'hastaya_yanlis_ilac_verilmesi', label: 'Hastaya yanlış ilaç verilmesi' },
        { value: 'hastaya_yanlis_kan_verilmesi', label: 'Hastaya yanlış kan verilmesi' },
        { value: 'hastaya_yanlis_rapor_veya_sonucun_verilmesi', label: 'Hastaya yanlış rapor veya sonucun verilmesi' },
        { value: 'hastaya_yanlis_recete_verilmesi', label: 'Hastaya yanlış reçete verilmesi' },
        { value: 'hemsire_cagri_sistemi_kullaniminin_hastaya_anlatilmamis_olmasi', label: 'Hemşire çağrı sistemi kullanımının hastaya anlatılmamış olması' },
        { value: 'ilac_etiketindeki_bilgilerin_hatali_olmasi', label: 'İlaç etiketindeki bilgilerin hatalı olması' },
        { value: 'ilac_etiketlemenin_yapilmamis_olmasi', label: 'İlaç etiketlemenin yapılmamış olması' },
        { value: 'ilac_etiketlerinin_uygunsuz_yapistirilmasi', label: 'İlaç etiketlerinin uygunsuz yapıştırılması' },
        { value: 'ilac_uygulamalari_ve_operasyon_sonrasi_vital_bulgularin_takibinin_yetersizligi', label: 'İlaç uygulamaları ve operasyon sonrası vital bulguların takibinin yetersizliği' },
        { value: 'kan_transfuzyon_prosedurune_uyulmamasi', label: 'Kan transfüzyon prosedürüne uyulmaması' },
        { value: 'kan_ve_kan_urunlerinin_transfuzyonuna_iliskin_hatalar', label: 'Kan ve kan ürünlerinin transfüzyonuna ilişkin hatalar' },
        { value: 'kaygan_zemin_uyari_gorselinin_bulunmamasi', label: 'Kaygan zemin uyarı görselinin bulunmaması' },
        { value: 'kimlik_dogrulamasinin_yapilmamis_olmasi', label: 'Kimlik doğrulamasının yapılmamış olması' },
        { value: 'kimyasal_madde_envanter_listesinin_bulunmamasi', label: 'Kimyasal madde envanter listesinin bulunmaması' },
        { value: 'kol_bileklikleri_uzerindeki_kimlik_bilgilerinin_okunaklı_olmamasi', label: 'Kol bileklikleri üzerindeki kimlik bilgilerinin okunaklı olmaması' },
        { value: 'konsultasyon_sureclerinin_etkin_sekilde_yurutulmemesi', label: 'Konsültasyon süreçlerinin etkin şekilde yürütülmemesi' },
        { value: 'kontrolsuz_su_isiticilarin_kullanilmasi', label: 'Kontrolsüz su ısıtıcılarının kullanılması' },
        { value: 'krokilerin_guncel_olmamasi', label: 'Krokilerin güncel olmaması' },
        { value: 'medikal_gaz_tuplerinin_sabitlenmemis_olmasi', label: 'Medikal gaz tüplerinin sabitlenmemiş olması' },
        { value: 'numunenin_kaybolmasi', label: 'Numunenin kaybolması' },
        { value: 'numunenin_yanlis_ya_da_eksik_etiketlenmesi', label: 'Numunenin yanlış ya da eksik etiketlenmesi' },
        { value: 'prizlerde_cocuk_korumasinin_olmamasi', label: 'Prizlerde çocuk korumasının olmaması' },
        { value: 'yuksek_riskli_kateterlerde_arteriyel_epidural_intratekal_uyarici_isaretleme_yapilmamis_olmasi', label: 'Yüksek riskli kateterlerde (arteriyel, epidural, intratekal) uyarıcı işaretleme yapılmamış olması' },
        { value: 'sharp_boxlarin_sabitlenmemis_olmasi', label: 'Sharp-box\'ların sabitlenmemiş olması' },
        { value: 'sinyalizasyonun_eksik_hatali_olmasi', label: 'Sinyalizasyonun eksik/hatalı olması' },
        { value: 'skt_kontrolunun_yapilmamasi', label: 'SKT kontrolünün yapılmaması' },
        { value: 'tatbikatlarin_yapilmamis_olmasi', label: 'Tatbikatların yapılmamış olması' },
        { value: 'tavana_degen_depolama_yapilmasi', label: 'Tavana değen depolama yapılması' },
        { value: 'teknik_mahallerin_kilitli_olmamasi', label: 'Teknik mahallerin kilitli olmaması' },
        { value: 'tirabzan_yuksekliklerinin_yeterli_olmamasi', label: 'Tırabzan yüksekliklerinin yeterli olmaması' },
        { value: 'yanlis_bolge_alan_cerrahisi_olmasi', label: 'Yanlış bölge/alan cerrahisi olması' },
        { value: 'yanlis_hastaya_cerrahi_mudahale_yapilmasi', label: 'Yanlış hastaya cerrahi müdahale yapılması' }
      ];

    case 'ilac_guvenligi':
      return [
        baseOption,
        { value: 'allerjik_reaksiyon', label: 'Allerjik reaksiyon' },
        { value: 'buzdolabinda_yanlis_ilaclarin_saklanmasi', label: 'Buzdolabında yanlış ilaçların saklanması' },
        { value: 'crash_cartlarin_kilitlenmemis_olmasi', label: 'Crash cart\'ların kilitlenmemiş olması' },
        { value: 'depolama_alanlarinin_sicaklik_ve_nem_degerleri_kontrol_altinda_tutulmamasi', label: 'Depolama alanlarının sıcaklık ve nem değerleri kontrol altında tutulmaması' },
        { value: 'eczane_disi_alanlarin_ilac_kontrollerinin_duzenli_yapilmamasi', label: 'Eczane dışı alanların ilaç kontrollerinin düzenli yapılmaması' },
        { value: 'eczaneden_gelen_orderlarda_eczaci_onayi_olmamasi', label: 'Eczaneden gelen orderlarda eczacı onayı olmaması' },
        { value: 'eczaneye_gonderilen_ilac_orderlarinda_hekim_onayi_olmamasi', label: 'Eczaneye gönderilen ilaç orderlarında hekim onayı olmaması' },
        { value: 'eczaneye_iade_edilen_ilaclarin_teslim_sureclerindeki_uygunsuzluk', label: 'Eczaneye iade edilen ilaçların teslim süreçlerindeki uygunsuzluk' },
        { value: 'ehu_onayi_gerektiren_antibiyotiklerin_onaysiz_kullanimi', label: 'EHU onayı gerektiren antibiyotiklerin onaysız kullanımı' },
        { value: 'enjektore_cekilmis_ilaclarin_bekletilmesi', label: 'Enjektöre çekilmiş ilaçların bekletilmesi' },
        { value: 'hasta_beraberinde_gelen_ilaclarin_kontrolu_prosedurune_uyulmamasi', label: 'Hasta beraberinde gelen ilaçların kontrolü prosedürüne uyulmaması' },
        { value: 'ilac_buzdolabinda_yiyecek_bulundurulmasi', label: 'İlaç buzdolabında yiyecek bulundurulması' },
        { value: 'ilac_depolarinda_ve_buzdolaplarinda_ilac_harici_malzeme_bulundurulmasi', label: 'İlaç depolarında ve buzdolaplarında ilaç harici malzeme bulundurulması' },
        { value: 'ilac_dolabinin_erisime_acik_sekilde_birakilmasi', label: 'İlaç dolabının erişime açık şekilde bırakılması' },
        { value: 'ilac_etiketlerinin_uygun_sekilde_yapistirilmamasi_veya_etiketsiz_ilac_bulundurulmasi', label: 'İlaç etiketlerinin uygun şekilde yapıştırılmaması veya etiketsiz ilaç bulundurulması' },
        { value: 'ilac_orderlarinda_doz_bilgisinin_yazilmamasi', label: 'İlaç orderlarında doz bilgisinin yazılmaması' },
        { value: 'ilac_orderlarinda_verilis_yolu_bilgisinin_yazilmamasi', label: 'İlaç orderlarında veriliş yolu bilgisinin yazılmaması' },
        { value: 'ilac_son_kullanma_tarihlerinin_belli_olmamasi_veya_gecmis_olmasi', label: 'İlaç son kullanma tarihlerinin belli olmaması veya geçmiş olması' },
        { value: 'ilac_ticari_ismi_yerine_etken_madde_yazilarak_order_edilmesi', label: 'İlaç ticari ismi yerine etken madde yazılarak order edilmesi' },
        { value: 'ilac_ticari_isminin_kisaltilarak_yazilmasi', label: 'İlaç ticari isminin kısaltılarak yazılması' },
        { value: 'ilac_yerlesiminin_hatali_olmasi', label: 'İlaç yerleşiminin hatalı olması' },
        { value: 'ilaclarin_minimum_kritik_ve_maksimum_stok_seviyelerinin_belirlenmemis_olmasi', label: 'İlaçların minimum, kritik ve maksimum stok seviyelerinin belirlenmemiş olması' },
        { value: 'ilaclarin_saklama_kosullarinin_uygun_olmamasi_sicaklik_nem_isik_vb', label: 'İlaçların saklama koşullarının uygun olmaması (sıcaklık, nem, ışık vb.)' },
        { value: 'kirli_ve_temiz_odalarin_kilitli_olmamasi', label: 'Kirli ve temiz odaların kilitli olmaması' },
        { value: 'luzum_hali_yazilan_orderlarda_endikasyon_belirtilmemesi', label: 'Lüzum hali yazılan orderlarda endikasyon belirtilmemesi' },
        { value: 'narkotik_psikotrop_ilaclarin_guvenliginin_yeterince_saglanmamasi', label: 'Narkotik/psikotrop ilaçların güvenliğinin yeterince sağlanmaması' },
        { value: 'narkotik_psikotrop_ilaclarin_kilit_altinda_olmamasi', label: 'Narkotik/psikotrop ilaçların kilit altında olmaması' },
        { value: 'narkotik_psikotrop_ilac_uygulama_takip_formunun_eksik_doldurulmasi', label: 'Narkotik–Psikotrop İlaç Uygulama Takip Formunun eksik doldurulması' },
        { value: 'sozel_orderlarin_politikalara_uygun_verilmemesi_veya_onaylanmamasi', label: 'Sözel orderların politikalara uygun verilmemesi veya onaylanmaması' },
        { value: 'sulandirildiktan_acildiktan_veya_hazirlandiktan_sonra_muhafaza_sartlarina_uyulmamasi', label: 'Sulandırıldıktan, açıldıktan veya hazırlandıktan sonra muhafaza şartlarına uyulmaması' },
        { value: 'tedavi_sonrasi_yarim_kalan_ampullerin_imhasi_surecinin_bilinmemesi', label: 'Tedavi sonrası yarım kalan ampullerin imhası sürecinin bilinmemesi' },
        { value: 'yazilan_ilac_orderlarinda_karalama_veya_tipki_tipex_kullanimi', label: 'Yazılan ilaç orderlarında karalama veya tıpkı tıpex kullanımı' },
        { value: 'yazilan_ilac_orderlarinin_okunaklı_olmamasi', label: 'Yazılan ilaç orderlarının okunaklı olmaması' },
        { value: 'yri_narkotik_ve_kemoterapi_ilaclarin_sozel_order_olarak_verilmesi', label: 'YRİ, narkotik ve kemoterapi ilaçlarının sözel order olarak verilmesi' },
        { value: 'yuksek_riskli_ilac_orderlarinin_doz_yerine_ampul_olarak_order_edilmesi', label: 'Yüksek riskli ilaç orderlarının doz yerine ampul olarak order edilmesi' },
        { value: 'yuksek_riskli_ilaclarin_etiketsiz_veya_kilit_altinda_olmamasi', label: 'Yüksek riskli ilaçların etiketsiz veya kilit altında olmaması' }
      ];

    case 'temizlik_yonetimi':
      return [
        baseOption,
        { value: 'alanin_kirli_olmasi', label: 'Alanın kirli olması' },
        { value: 'atik_kovasinin_kirik_olmasi', label: 'Atık kovasının kırık olması' },
        { value: 'hastane_temizliginin_yetersiz_olmasi', label: 'Hastane temizliğinin yetersiz olması' },
        { value: 'kimyasal_temizlik_maddelerinin_personel_tarafindan_dogru_sekilde_kullanilmamasi_ve_uygun_guvenlik_onlemlerinin_alinmamasi', label: 'Kimyasal temizlik maddelerinin personel tarafından doğru şekilde kullanılmaması ve uygun güvenlik önlemlerinin alınmaması' },
        { value: 'kirli_odalarinin_istenilen_standartlari_karsilamamasi', label: 'Kirli odalarının istenilen standartları karşılamaması' },
        { value: 'kirli_temiz_oda_sicaklik_ve_nem_takiplerinin_yapilmamasi', label: 'Kirli temiz oda sıcaklık ve nem takiplerinin yapılmaması' },
        { value: 'kirli_temizlik_malzemelerinin_temiz_alanlara_tasinmasi', label: 'Kirli temizlik malzemelerinin temiz alanlara taşınması' },
        { value: 'kirli_ve_temiz_odalarinin_kilitli_olmamasi', label: 'Kirli ve temiz odalarının kilitli olmaması' },
        { value: 'kontrol_listelerinin_etkin_doldurulmamasi', label: 'Kontrol listelerinin etkin doldurulmaması' },
        { value: 'kullanilan_dezenfektanlarin_etiketlenmemis_olmasi', label: 'Kullanılan dezenfektanların etiketlenmemiş olması' },
        { value: 'kullanilan_dezenfektanlarin_uygun_olmamasi', label: 'Kullanılan dezenfektanların uygun olmaması' },
        { value: 'oda_temizliginin_yetersiz_olmasi', label: 'Oda temizliğinin yetersiz olması' },
        { value: 'odada_banyo_malzeme_eksikligi', label: 'Odada banyo malzeme eksikliği' },
        { value: 'odada_hasere_gorulmesi', label: 'Odada haşere görülmesi' },
        { value: 'odalarda_hijyenik_olmayan_kosullarin_surdurulmesi_ornegin_sizinti_curuk_kotu_kokular', label: 'Odalarda hijyenik olmayan koşulların sürdürülmesi (örneğin, sızıntı, çürük, kötü kokular)' },
        { value: 'partikul_olcumunun_yapilmamasi', label: 'Partikül ölçümünün yapılmaması' },
        { value: 'temiz_odalarinin_amac_disi_kullanimi', label: 'Temiz odalarının amaç dışı kullanımı' },
        { value: 'temizligin_yanlis_zamanda_yapilmasi', label: 'Temizliğin yanlış zamanda yapılması' },
        { value: 'temizlik_icin_kullanilan_malzemelerin_son_kullanim_tarihlerinin_gecmis_olmasi', label: 'Temizlik için kullanılan malzemelerin son kullanım tarihlerinin geçmiş olması' },
        { value: 'temizlik_personelinin_yetersiz_egitim_almis_olmasi', label: 'Temizlik personelinin yetersiz eğitim almış olması' },
        { value: 'temizlik_sirasinda_kullanilan_bezlerin_ve_moplarin_yeterince_temizlenmemesi', label: 'Temizlik sırasında kullanılan bezlerin ve mopların yeterince temizlenmemesi' },
        { value: 'temizlik_sonrasi_malzeme_ve_ekipmanlarin_yanlis_sekilde_depolanmasi', label: 'Temizlik sonrası malzeme ve ekipmanların yanlış şekilde depolanması' },
        { value: 'temizlik_sonrasinda_yuzeylerin_tamamen_kuru_olmamasi_nemli_birakilmasi', label: 'Temizlik sonrasında yüzeylerin tamamen kuru olmaması, nemli bırakılması' },
        { value: 'yatak_takiminin_degistirilmemesi', label: 'Yatak takımının değiştirilmemesi' },
        { value: 'yatak_takiminin_kirli_lekeli_olmasi', label: 'Yatak takımının kirli / lekeli olması' }
      ];

    case 'yangin_guvenligi':
      return [
        baseOption,
        { value: 'acil_durum_aydinlatmasinin_calismamasi_veya_eksik_olmasi', label: 'Acil durum aydınlatmasının çalışmaması veya eksik olması' },
        { value: 'acil_durum_iletisim_sistemlerinin_calismamasi', label: 'Acil durum iletişim sistemlerinin çalışmaması' },
        { value: 'acik_saftlarin_bulunuyor_olmasi', label: 'Açık şaftların bulunuyor olması' },
        { value: 'bina_disi_yangin_guvenligi_tedbirlerinin_alinmamasi', label: 'Bina dışı yangın güvenliği tedbirlerinin alınmaması' },
        { value: 'bina_ici_yangin_guvenligi_planlarinin_guncellenmemesi', label: 'Bina içi yangın güvenliği planlarının güncellenmemesi' },
        { value: 'elektrik_kablolarinin_zeminde_daginik_olmasi', label: 'Elektrik kablolarının zeminde dağınık olması' },
        { value: 'elektrik_pano_odalarinda_atil_ve_yanici_malzemelerin_bulunmasi', label: 'Elektrik pano odalarında atıl ve yanıcı malzemelerin bulunması' },
        { value: 'elektrik_pano_odalarinda_isiklandirmalarin_exproof_olmamasi', label: 'Elektrik pano odalarında ışıklandırmaların exproof olmaması' },
        { value: 'elektrik_pano_odalarinin_kilitli_tutulmamasi', label: 'Elektrik pano odalarının kilitli tutulmaması' },
        { value: 'tarihi_gecmis_yangin_tupu_olmasi', label: 'Tarihi geçmiş yangın tüpü olması' },
        { value: 'tek_yangin_cikisinin_olmasi', label: 'Tek yangın çıkışının olması' },
        { value: 'yangin_alarm_sisteminin_test_edilmemesi', label: 'Yangın alarm sisteminin test edilmemesi' },
        { value: 'yangin_algilama_sensorlerinin_yanlis_konumlandirilmasi', label: 'Yangın algılama sensörlerinin yanlış konumlandırılması' },
        { value: 'yangin_cikis_kapisinin_yonetmelige_uygun_olmamasi', label: 'Yangın çıkış kapısının yönetmeliğe uygun olmaması' },
        { value: 'yangin_cikis_koridorunda_veya_yangin_merdiveninde_depolama_yapilmasi', label: 'Yangın çıkış koridorunda veya yangın merdiveninde depolama yapılması' },
        { value: 'yangin_dolabi_kontrolunun_yapilmamis_olmasi', label: 'Yangın dolabı kontrolünün yapılmamış olması' },
        { value: 'yangin_dolabi_onunde_depolama_yapilmasi', label: 'Yangın dolabı önünde depolama yapılması' },
        { value: 'yangin_erken_uyari_sistemlerinin_calismamasi_ya_da_arizali_olmasi', label: 'Yangın erken uyarı sistemlerinin çalışmaması ya da arızalı olması' },
        { value: 'yangin_guvenligi_egitiminin_verilmemis_olmasi', label: 'Yangın güvenliği eğitiminin verilmemiş olması' },
        { value: 'yangin_guvenligi_ekipmanlarinin_yanlis_depolanmasi', label: 'Yangın güvenliği ekipmanlarının yanlış depolanması' },
        { value: 'yangin_guvenlik_ekipmanlarinin_bakim_ve_kontrolunun_yapilmamasi', label: 'Yangın güvenlik ekipmanlarının bakım ve kontrolünün yapılmaması' },
        { value: 'yangin_guvenlik_prosedurlerinin_calisanlara_duyurulmamasi', label: 'Yangın güvenlik prosedürlerinin çalışanlara duyurulmaması' },
        { value: 'yangin_kapilarinin_acik_tutuluyor_olmasi', label: 'Yangın kapılarının açık tutuluyor olması' },
        { value: 'yangin_kapilarinin_acildiktan_sonra_kendiliginden_kapanmamasi', label: 'Yangın kapılarının açıldıktan sonra kendiliğinden kapanmaması' },
        { value: 'yangin_merdivenlerinin_bakimsiz_olmasi', label: 'Yangın merdivenlerinin bakımsız olması' },
        { value: 'yangin_riski_tasiyan_alanlarda_sigara_icilmesi', label: 'Yangın riski taşıyan alanlarda sigara içilmesi' },
        { value: 'yangin_sistemlerinin_yillik_periyodik_muayenelerinin_yapilmamasi', label: 'Yangın sistemlerinin yıllık periyodik muayenelerinin yapılmaması' },
        { value: 'yangin_sondurme_cihazlarinin_uygun_olmayan_yerde_bulundurulmasi', label: 'Yangın söndürme cihazlarının uygun olmayan yerde bulundurulması' },
        { value: 'yangin_sondurme_sistemlerinin_devre_disi_birakilmasi', label: 'Yangın söndürme sistemlerinin devre dışı bırakılması' },
        { value: 'yangin_sondurme_sistemlerinin_yetersiz_kapasitede_olmasi', label: 'Yangın söndürme sistemlerinin yetersiz kapasitede olması' },
        { value: 'yangin_sondurucusu_onlerinde_engellerin_olmasi', label: 'Yangın söndürücü önlerinde engellerin olması' },
        { value: 'yangin_tatbikatinin_yapilmamis_olmasi', label: 'Yangın tatbikatının yapılmamış olması' },
        { value: 'yangin_tupu_uzerindeki_etiketlemelerin_uygun_olmamasi', label: 'Yangın tüpü üzerindeki etiketlemelerin uygun olmaması' },
        { value: 'yangin_tupunun_sabitlenmemis_olmasi', label: 'Yangın tüpünün sabitlenmemiş olması' },
        { value: 'yangin_yonlendirmelerinin_eksik_veya_hatali_olmasi', label: 'Yangın yönlendirmelerinin eksik veya hatalı olması' },
        { value: 'yanici_maddelerin_hatali_depolanmasi', label: 'Yanıcı maddelerin hatalı depolanması' },
        { value: 'yanici_malzemelerin_ve_kimyasallarin_yangin_guvenligi_yonergelerine_uygun_sekilde_etiketlenmemesi', label: 'Yanıcı malzemelerin ve kimyasalların yangın güvenliği yönergelerine uygun şekilde etiketlenmemesi' }
      ];

    case 'personel_yonetimi':
      return [
        baseOption,
        { value: 'bolum_organizasyon_semasinin_bulunmamasi', label: 'Bölüm organizasyon şemasının bulunmaması' },
        { value: 'cihazin_kullanimi_hakkinda_bilgi_sahibi_olunmamasi', label: 'Cihazın kullanımı hakkında bilgi sahibi olunmaması' },
        { value: 'calisan_guvenligi_programinin_bilinmemesi', label: 'Çalışan güvenliği programının bilinmemesi' },
        { value: 'egitim_kayitlarinin_eksik_olmasi', label: 'Eğitim kayıtlarının eksik olması' },
        { value: 'egitim_verilmemis_olmasi', label: 'Eğitim verilmemiş olması' },
        { value: 'gorev_yetki_ve_sorumluluklarin_yerine_getirilmemesi', label: 'Görev, yetki ve sorumlulukların yerine getirilmemesi' },
        { value: 'hasta_calisan_guvenligi_olay_bildirimlerinin_yapilmamasi', label: 'Hasta çalışan güvenliği olay bildirimlerinin yapılmaması' },
        { value: 'hasta_guvenligi_programinin_bilinmemesi', label: 'Hasta güvenliği programının bilinmemesi' },
        { value: 'kilik_kiyafet_prosedurune_uyulmamasi', label: 'Kılık kıyafet prosedürüne uyulmaması' },
        { value: 'mail_mesaj_vb_yazismalara_donus_yapilmamasi', label: 'Mail, mesaj vb. yazışmalara dönüş yapılmaması' },
        { value: 'oryantasyon_egitim_eksikligi_nedeniyle_yanlis_uygulama_yapilmasi', label: 'Oryantasyon eğitim eksikliği nedeniyle yanlış uygulama yapılması' },
        { value: 'otomasyon_sisteminin_kullanilmamasi', label: 'Otomasyon sisteminin kullanılmaması' },
        { value: 'personelin_yaka_kartinin_olmamasi', label: 'Personelin yaka kartının olmaması' },
        { value: 'prosedur_hakkinda_bilgi_sahibi_olunmamasi', label: 'Prosedür hakkında bilgi sahibi olunmaması' },
        { value: 'prosedur_ve_talimatlarin_uygulanmamasi', label: 'Prosedür ve talimatların uygulanmaması' },
        { value: 'sertifikali_personelin_olmamasi', label: 'Sertifikalı personelin olmaması' },
        { value: 'yeni_baslayan_personele_gerekli_oryantasyon_egitiminin_verilmemesi', label: 'Yeni başlayan personele gerekli oryantasyon eğitiminin verilmemesi' },
        { value: 'personelin_gorev_tanimina_uygun_olmayan_islerde_calistirilmasi', label: 'Personelin görev tanımına uygun olmayan işlerde çalıştırılması' },
        { value: 'calisan_performans_degerlendirmelerinin_yapilmamasi', label: 'Çalışan performans değerlendirmelerinin yapılmaması' },
        { value: 'nobet_devir_teslimlerinin_eksik_veya_hatali_yapilmasi', label: 'Nöbet devir teslimlerinin eksik veya hatalı yapılması' }
      ];

    case 'hasta_guvenligi_mahremiyeti':
      return [
        baseOption,
        { value: 'acil_mudahale_gerektiren_durumlarda_mudahale_suresinin_uzamasi', label: 'Acil müdahale gerektiren durumlarda müdahale süresinin uzaması' },
        { value: 'bolume_ozgu_risklerin_tanimlanmamasi', label: 'Bölüme özgü risklerin tanımlanmaması' },
        { value: 'hasta_odasi_veya_ofislerde_kacis_plani_olmamasi', label: 'Hasta odası veya ofislerde kaçış planı olmaması' },
        { value: 'ilac_etkilesimlerinin_goz_ardi_edilmesi', label: 'İlaç etkileşimlerinin göz ardı edilmesi' },
        { value: 'krokilerin_guncel_olmamasi', label: 'Krokilerin güncel olmaması' },
        { value: 'yanlis_dozajda_ilac_verilmesi', label: 'Yanlış dozajda ilaç verilmesi' }
      ];

    case 'tani_ve_tedavi_hizmetleri':
      return [
        baseOption,
        { value: 'agri_yonetiminin_etkin_yapilamamamasi', label: 'Ağrı yönetiminin etkin yapılamaması' },
        { value: 'belirtilen_operasyonun_yapilmadigi_dusuncesi', label: 'Belirtilen operasyonun yapılmadığı düşüncesi' },
        { value: 'diyetisyen_tarafindan_hastanin_degerlendirilmemesi', label: 'Diyetisyen tarafından hastanın değerlendirilmemesi' },
        { value: 'gerekli_tedavi_bakim_veya_mudahalenin_eksik_yapilmasi', label: 'Gerekli tedavi, bakım veya müdahalenin eksik yapılması' },
        { value: 'gerekli_tedavi_bakim_veya_mudahalenin_zamaninda_yapilamamamasi', label: 'Gerekli tedavi, bakım veya müdahalenin zamanında yapılamaması' },
        { value: 'hastada_basinc_yarasi_gelmis_olmasi', label: 'Hastada basınç yarası gelişmiş olması' },
        { value: 'hastanin_hekim_tarafindan_odada_ziyaret_edilmemesi', label: 'Hastanın hekim tarafından odada ziyaret edilmemesi' },
        { value: 'hastaya_ait_raporun_gec_yazilmasi', label: 'Hastaya ait raporun geç yazılması' },
        { value: 'ilacin_gec_gelmesi', label: 'İlacın geç gelmesi' },
        { value: 'kan_alma_surelerinin_olculmemesi', label: 'Kan alma sürelerinin ölçülmemesi' },
        { value: 'malzeme_eksikligi_nedeni_ile_hizmet_verilememesi', label: 'Malzeme eksikliği nedeni ile hizmet verilememesi' },
        { value: 'operasyona_baska_hekimin_girdigi_dusuncesi', label: 'Operasyona başka hekimin girdiği düşüncesi' },
        { value: 'randevu_ve_sonuc_verme_surelerinin_olculmemesi', label: 'Randevu ve sonuç verme sürelerinin ölçülmemesi' },
        { value: 'randevuya_uyum_saglanmamasi', label: 'Randevuya uyum sağlanmaması' },
        { value: 'sonuclarin_zamaninda_verilmemesi', label: 'Sonuçların zamanında verilmemesi' },
        { value: 'tani_konulamamasi', label: 'Tanı konulamaması' },
        { value: 'taninin_gec_konulmasi', label: 'Tanının geç konulması' },
        { value: 'tedavi_etkili_degil_iyilestirme_sureci_saglanamadi', label: 'Tedavi etkili değil, iyileştirme süreci sağlanamadı' },
        { value: 'yanlis_tani_konulmasi', label: 'Yanlış tanı konulması' }
      ];

    case 'hasta_mahremiyeti_ve_tibbi_kayitlar':
      return [
        baseOption,
        { value: 'ayni_anda_poliklinik_odasinda_iki_hastanin_bulunmasi', label: 'Aynı anda poliklinik odasında iki hastanın bulunması' },
        { value: 'dosya_ya_da_raporda_eksiklik_veya_hata_olmasi', label: 'Dosya ya da raporda eksiklik veya hata olması' },
        { value: 'hasta_bilgi_gizliliginin_saglanmiyor_olmasi', label: 'Hasta bilgi gizliliğinin sağlanmıyor olması' },
        { value: 'hasta_bilgilerinin_hastanin_onayi_disinda_baskasıyla_paylasilmasi', label: 'Hasta bilgilerinin hastanın onayı dışında başkasıyla paylaşılması' },
        { value: 'hasta_dosyalarinin_karistirilmasi', label: 'Hasta dosyalarının karıştırılması' },
        { value: 'hasta_dosyalarinin_ulasilabilir_sekilde_depolanmasi', label: 'Hasta dosyalarının ulaşılabilir şekilde depolanması' },
        { value: 'hasta_mahremiyetine_dikkat_edilmemesi', label: 'Hasta mahremiyetine dikkat edilmemesi' },
        { value: 'hastalara_ait_bilgilerin_acikta_birakilmasi', label: 'Hastalara ait bilgilerin açıkta bırakılması' },
        { value: 'hastaya_ait_hizmet_girislerinin_yapilmamasi', label: 'Hastaya ait hizmet girişlerinin yapılmaması' },
        { value: 'mahremiyet_perdesinin_olmamasi', label: 'Mahremiyet perdesinin olmaması' },
        { value: 'tibbi_kayit_girisinde_yanlislik_yapilmasi', label: 'Tıbbi kayıt girişinde yanlışlık yapılması' },
        { value: 'tibbi_kayitlarin_kaybolmasi_veya_zarar_gormesi', label: 'Tıbbi kayıtların kaybolması veya zarar görmesi' }
      ];

    case 'calisanlarin_tutum_ve_davranislari':
      return [
        baseOption,
        { value: 'calisanlarin_hastalari_yanlis_yonlendirmesi', label: 'Çalışanların hastaları yanlış yönlendirmesi' },
        { value: 'calisanlar_arasinda_iletisim_sorunu_olmasi', label: 'Çalışanlar arasında iletişim sorunu olması' },
        { value: 'calisan_hijyeninde_yetersizlik', label: 'Çalışan hijyeninde yetersizlik' },
        { value: 'calisanlarin_is_sagligi_ve_guvenligi_konusuna_dikkat_etmemesi', label: 'Çalışanların iş sağlığı ve güvenliği konusuna dikkat etmemesi' },
        { value: 'eksik_veya_yanlis_bilgilendirme_yapilmasi', label: 'Eksik veya yanlış bilgilendirme yapılması' },
        { value: 'hastalarin_mahremiyetine_ve_sayginligina_dikkat_edilmemesi', label: 'Hastaların mahremiyetine ve saygınlığına dikkat edilmemesi' },
        { value: 'ilgi_eksikligi', label: 'İlgi eksikliği' },
        { value: 'istenildiginde_calisana_ulasilamamasi', label: 'İstenildiğinde çalışana ulaşılamaması' },
        { value: 'isinde_yetkin_ve_becerikli_olmama', label: 'İşinde yetkin ve becerikli olmama' }
      ];

    case 'laboratuvar_ve_radyoloji_hizmetleri':
      return [
        baseOption,
        { value: 'alinan_ornegin_kaydinin_eksik_veya_gec_yapilmasi', label: 'Alınan örneğin kaydının eksik veya geç yapılması' },
        { value: 'analitik_hatalar', label: 'Analitik hatalar' },
        { value: 'baska_hastaya_ait_sonuclarin_verilmesi', label: 'Başka hastaya ait sonuçların verilmesi' },
        { value: 'biyolojik_numunelerin_tasinmasinda_sizinti_veya_dokulme_olmasi', label: 'Biyolojik numunelerin taşınmasında sızıntı veya dökülme olması' },
        { value: 'cihaz_arizasi', label: 'Cihaz arızası' },
        { value: 'cekim_icin_uzun_sure_beklenilmesi', label: 'Çekim için uzun süre beklenilmesi' },
        { value: 'gizlilik_ihlalleri_hastaya_ait_test_sonuclarinin_yanlis_kisilere_verilmesi', label: 'Gizlilik ihlalleri (hastaya ait test sonuçlarının yanlış kişilere verilmesi)' },
        { value: 'goruntulerin_net_olmamasi_veya_dusuk_cozunurluklu_olmasi', label: 'Görüntülerin net olmaması veya düşük çözünürlüklü olması' },
        { value: 'hasta_veya_personelin_asiri_radyasyona_maruz_kalmasi', label: 'Hasta veya personelin aşırı radyasyona maruz kalması' },
        { value: 'hastadan_yeniden_numune_alinmasi', label: 'Hastadan yeniden numune alınması' },
        { value: 'hastaya_ait_raporun_gec_onaylanmasi', label: 'Hastaya ait raporun geç onaylanması' },
        { value: 'kimyasal_madde_dokulmesi_veya_sicramasi', label: 'Kimyasal madde dökülmesi veya sıçraması' },
        { value: 'laboratuvar_cihazlarinin_arizalanmasi_otomatik_analizor_mikroskop_vb', label: 'Laboratuvar cihazlarının arızalanması (otomatik analizör, mikroskopvb.)' },
        { value: 'laboratuvar_hatalarinin_olay_bildirimine_konu_edilmemesi', label: 'Laboratuvar hatalarının olay bildirimine konu edilmemesi' },
        { value: 'numune_vermek_icin_uzun_sure_beklenilmesi', label: 'Numune vermek için uzun süre beklenilmesi' },
        { value: 'post_analitik_hatalar', label: 'Post-analitik hatalar' },
        { value: 'pre_analitik_hatalar', label: 'Pre-analitik hatalar' },
        { value: 'radyasyon_dozunun_fazla_verilmesi_veya_yanlis_yonlendirilmesi', label: 'Radyasyon dozunun fazla verilmesi veya yanlış yönlendirilmesi' },
        { value: 'radyasyon_guvenligi_egitim_eksiklikleri', label: 'Radyasyon güvenliği eğitim eksiklikleri' },
        { value: 'radyasyon_koruma_onlemlerinin_alinmamasi_kursun_onluk_koruyucu_gozluk_vb', label: 'Radyasyon koruma önlemlerinin alınmaması (kurşun önlük, koruyucu gözlük vb.)' },
        { value: 'radyasyon_sizintisi_veya_guvenlik_ihlali_radyoloji_odasi_kapali_olmadan_cihazin_calistirilmasi', label: 'Radyasyon sızıntısı veya güvenlik ihlali (radyoloji odası kapalı olmadan cihazın çalıştırılması)' },
        { value: 'radyolojik_goruntulerin_yanlis_yorumlanmasi', label: 'Radyolojik görüntülerin yanlış yorumlanması' },
        { value: 'rapor_icin_ek_ucret_talep_edilmesi', label: 'Rapor için ek ücret talep edilmesi' },
        { value: 'raporun_yanlis_yazildigi_dusuncesi', label: 'Raporun yanlış yazıldığı düşüncesi' },
        { value: 'sonuclarin_belirtilen_sure_icinde_verilmemesi', label: 'Sonuçların belirtilen süre içinde verilmemesi' },
        { value: 'testlerin_onaylanmadan_yapilmasi_veya_yanlis_hastaya_raporlanmasi', label: 'Testlerin onaylanmadan yapılması veya yanlış hastaya raporlanması' },
        { value: 'yanlis_cekim_yapilmasi', label: 'Yanlış çekim yapılması' },
        { value: 'yanlis_goruntuleme_yontemi_kullanilmasi_ornegin_mr_yerine_bt', label: 'Yanlış görüntüleme yöntemi kullanılması (örneğin MR yerine BT)' },
        { value: 'yanlis_test_icin_hasta_hazirligi_yapilmasi_ornegin_aclik_durumu_ilac_kullanimi_vb', label: 'Yanlış test için hasta hazırlığı yapılması (örneğin açlık durumu, ilaç kullanımı vb.)' }
      ];

    case 'yatis_ve_taburculuk_islemleri':
      return [
        baseOption,
        { value: 'hastanin_yatis_icin_yanlis_kata_yonlendirilmesi', label: 'Hastanın yatış için yanlış kata yönlendirilmesi' },
        { value: 'cikis_islemi_teyit_edilmeden_hastanin_gonderilmesi', label: 'Çıkış işlemi teyit edilmeden hastanın gönderilmesi' },
        { value: 'cikis_islemlerinin_uzun_surmesi_sigorta_onayi_haric', label: 'Çıkış işlemlerinin uzun sürmesi (sigorta onayı hariç)' },
        { value: 'hastaya_onay_vermeden_uygulama_alanina_yonlendirilmesi', label: 'Hastaya onay vermeden uygulama alanına yönlendirilmesi' },
        { value: 'oda_rezervasyonunda_aksaklik_yasanmasi', label: 'Oda rezervasyonunda aksaklık yaşanması' },
        { value: 'randevu_kontrol_veya_ilac_bilgisi_gibi_konularda_hastaya_eksik_bilgi_verilmesi', label: 'Randevu, kontrol veya ilaç bilgisi gibi konularda hastaya eksik bilgi verilmesi' },
        { value: 'sigorta_yatis_cikis_onayinin_gecikmesi', label: 'Sigorta yatış–çıkış onayının gecikmesi' },
        { value: 'sigortanin_odeme_onayi_vermemesi', label: 'Sigortanın ödeme onayı vermemesi' },
        { value: 'taburculuk_surecinin_aksamasindan_dolayi_yeni_hastanin_yatirilamamasi', label: 'Taburculuk sürecinin aksamasından dolayı yeni hastanın yatırılamaması' },
        { value: 'taburculuk_egitiminin_yapilmamasi_veya_belgelenmemesi', label: 'Taburculuk eğitiminin yapılmaması veya belgelenmemesi' },
        { value: 'uygun_olmayan_oda_izolasyon_onlemiyle_hasta_yatisi_yapilmasi', label: 'Uygun olmayan oda/izolasyon önlemiyle hasta yatışı yapılması' },
        { value: 'yatis_asamasinda_uzun_sureli_bekleme_sigorta_onayi_haric', label: 'Yatış aşamasında uzun süreli bekleme (sigorta onayı hariç)' },
        { value: 'yatis_dosyasinda_eksiklik_evrak_imza_vb_bulunmasi', label: 'Yatış dosyasında eksiklik (evrak, imza vb.) bulunması' },
        { value: 'yatis_islemleri_sirasinda_hasta_ve_yakinlarina_yeterli_rehberlik_saglanmamasi', label: 'Yatış işlemleri sırasında hasta ve yakınlarına yeterli rehberlik sağlanmaması' }
      ];

    case 'ucretlendirme_ve_faturalama_hizmetleri':
      return [
        baseOption,
        { value: 'ayrintili_fatura_verilmemesi', label: 'Ayrıntılı fatura verilmemesi' },
        { value: 'cagri_merkezinden_verilen_fiyat_ile_bankodan_alinan_fiyatin_farkli_olmasi', label: 'Çağrı merkezinden verilen fiyat ile bankodan alınan fiyatın farklı olması' },
        { value: 'fiyat_bilgisi_verilmemesi_veya_alinamamasi', label: 'Fiyat bilgisi verilmemesi veya alınamaması' },
        { value: 'hastaneler_arasi_ucret_farkliliginin_bulunmasi', label: 'Hastaneler arası ücret farklılığının bulunması' },
        { value: 'iade_surecinin_aksamasi_nedeniyle_hasta_sikayeti', label: 'İade sürecinin aksaması nedeniyle hasta şikayeti' },
        { value: 'kurumundan_yararlanamadigi_ya_da_anlasma_sartlarindan_fazla_ucret_alindigi_dusuncesi', label: 'Kurumundan yararlanamadığı ya da anlaşma şartlarından fazla ücret alındığı düşüncesi' },
        { value: 'ozel_saglik_sigortasi_oss_ve_anlasmali_kurumlarla_ilgili_aksaklik_yasanmasi', label: 'Özel sağlık sigortası (ÖSS) ve anlaşmalı kurumlarla ilgili aksaklık yaşanması' },
        { value: 'ucrete_itiraz_edilmesi', label: 'Ücrete itiraz edilmesi' },
        { value: 'ucretlerin_yuksek_bulunmasi', label: 'Ücretlerin yüksek bulunması' }
      ];

    case 'cagri_merkezi_hizmeti':
      return [
        baseOption,
        { value: 'birakilan_nota_karsilik_aranmamasi', label: 'Bırakılan nota karşılık aranmaması' },
        { value: 'cagri_merkezi_personelinin_olumsuz_veya_profesyonellikten_uzak_bir_dil_kullanmasi', label: 'Çağrı merkezi personelinin olumsuz veya profesyonellikten uzak bir dil kullanması' },
        { value: 'cagri_merkezi_personelinin_yeterli_egitim_ve_bilgiye_sahip_olmamasi', label: 'Çağrı merkezi personelinin yeterli eğitim ve bilgiye sahip olmaması' },
        { value: 'cagri_merkezi_sisteminin_hatali_calismasi_baglanti_kopmasi_sesin_kesilmesi_vb', label: 'Çağrı merkezi sisteminin hatalı çalışması (bağlantı kopması, sesin kesilmesi vb.)' },
        { value: 'cagri_merkezine_ulasamama', label: 'Çağrı merkezine ulaşamama' },
        { value: 'cagri_merkezinin_bilgilendirme_ve_yonlendirmede_yetersiz_olmasi', label: 'Çağrı merkezinin bilgilendirme ve yönlendirmede yetersiz olması' },
        { value: 'ilgili_kisiye_notun_iletilmemesi', label: 'İlgili kişiye notun iletilmemesi' },
        { value: 'telefonun_bilgi_verilmeden_aktarilmasi', label: 'Telefonun bilgi verilmeden aktarılması' },
        { value: 'telefonun_surekli_mesgul_calmasi', label: 'Telefonun sürekli meşgul çalması' },
        { value: 'yanlis_doktora_randevu_verilmesi', label: 'Yanlış doktora randevu verilmesi' }
      ];

    case 'randevu_hizmetleri':
      return [
        baseOption,
        { value: 'hastaya_yanlis_randevu_verilmesi', label: 'Hastaya yanlış randevu verilmesi' },
        { value: 'ayni_saatte_farkli_iki_hastaneye_randevu_verilmesi', label: 'Aynı saatte farklı iki hastaneye randevu verilmesi' },
        { value: 'hastanin_bilgisi_disinda_randevu_iptali_veya_degisikligi_yapilmasi', label: 'Hastanın bilgisi dışında randevu iptali veya değişikliği yapılması' },
        { value: 'kontrol_icin_randevu_verilmemesi', label: 'Kontrol için randevu verilmemesi' },
        { value: 'randevu_alamama', label: 'Randevu alamama' },
        { value: 'randevu_degisikliginin_hastaya_bildirilmemesi', label: 'Randevu değişikliğinin hastaya bildirilmemesi' },
        { value: 'randevu_gun_ve_saati_hakkinda_hastanin_yanlis_bilgilendirilmesi', label: 'Randevu gün ve saati hakkında hastanın yanlış bilgilendirilmesi' },
        { value: 'randevu_kayit_islemlerinin_uzun_surmesi', label: 'Randevu kayıt işlemlerinin uzun sürmesi' },
        { value: 'randevu_surelerinin_kisa_olmasi', label: 'Randevu sürelerinin kısa olması' },
        { value: 'randevularda_sarkma_nedeniyle_hastanin_bekletilmesi', label: 'Randevularda sarkma nedeniyle hastanın bekletilmesi' },
        { value: 'randevunun_sistemde_gorunmemesi', label: 'Randevunun sistemde görünmemesi' },
        { value: 'sonuc_gostermek_icin_uzun_sure_beklenilmesi', label: 'Sonuç göstermek için uzun süre beklenilmesi' }
      ];

    case 'hastane_donanimi_ve_fiziksel_sorunlar':
      return [
        baseOption,
        { value: 'acil_cikis_isaretlerinin_kaybolmasi_veya_yetersiz_olmasi', label: 'Acil çıkış işaretlerinin kaybolması veya yetersiz olması' },
        { value: 'asensorun_arizali_olmasi', label: 'Asansörün arızalı olması' },
        { value: 'asensorun_uzun_sure_beklenilmesi', label: 'Asansörün uzun süre beklenilmesi' },
        { value: 'aydinlatmanin_yetersiz_olmasi', label: 'Aydınlatmanın yetersiz olması' },
        { value: 'bolumde_yeterli_sayida_sedye_veya_tekerlekli_sandalye_bulunmamasi', label: 'Bölümde yeterli sayıda sedye veya tekerlekli sandalye bulunmaması' },
        { value: 'duvarda_hasar_veya_kirik_olmasi', label: 'Duvarda hasar veya kırık olması' },
        { value: 'duvarlarin_boya_ihtiyaci_olmasi', label: 'Duvarların boya ihtiyacı olması' },
        { value: 'elektrik_prizlerinin_eksik_veya_guvenli_olmayan_sekilde_yerlestirilmesi', label: 'Elektrik prizlerinin eksik veya güvenli olmayan şekilde yerleştirilmesi' },
        { value: 'emzirme_odasi_mescit_bekleme_salonu_gibi_ortak_kullanim_alanlarinin_yetersiz_olmasi', label: 'Emzirme odası, mescit, bekleme salonu gibi ortak kullanım alanlarının yetersiz olması' },
        { value: 'genel_temizlik_hizmetlerinin_yetersizligi_koridorlar_odalar_tuvaletler_vb', label: 'Genel temizlik hizmetlerinin yetersizliği (koridorlar, odalar, tuvaletler vb.)' },
        { value: 'havalandirma_sisteminin_calismamasi', label: 'Havalandırma sisteminin çalışmaması' },
        { value: 'hemsire_cagri_zilinin_calismamasi', label: 'Hemşire çağrı zilinin çalışmaması' },
        { value: 'internet_veya_cep_telefonu_kullaniminda_aksaklik_yasanmasi', label: 'İnternet veya cep telefonu kullanımında aksaklık yaşanması' },
        { value: 'merdiven_asensorun_veya_rampalarin_fiziksel_hasar_almasi', label: 'Merdiven, asansör veya rampaların fiziksel hasar alması' },
        { value: 'odada_veya_alanda_su_sizintisi_olmasi', label: 'Odada veya alanda su sızıntısı olması' },
        { value: 'odadaki_ekipmanin_konforsuz_olmasi', label: 'Odadaki ekipmanın konforsuz olması' },
        { value: 'odadaki_ekipmanlarin_yetersiz_bakimsiz_veya_kirik_olmasi', label: 'Odadaki ekipmanların yetersiz, bakımsız veya kırık olması' },
        { value: 'odadaki_ekipmanlarin_calismamasi', label: 'Odadaki ekipmanların çalışmaması' },
        { value: 'odadaki_klimanin_veya_televizyonun_calismamasi', label: 'Odadaki klimanın veya televizyonun çalışmaması' },
        { value: 'odanin_veya_bolumun_istenilen_sicaklikta_olmamasi', label: 'Odanın veya bölümün istenilen sıcaklıkta olmaması' },
        { value: 'prizlerde_topraklama_etiketinin_bulunmamasi', label: 'Prizlerde topraklama etiketinin bulunmaması' },
        { value: 'sessiz_ortamin_saglanamamasi', label: 'Sessiz ortamın sağlanamaması' },
        { value: 'su_sebillerinin_olmamasi', label: 'Su sebillerinin olmaması' },
        { value: 'su_isinma_veya_sogutma_sistemlerinin_arizalanmasi', label: 'Su, ısınma veya soğutma sistemlerinin arızalanması' },
        { value: 'zeminin_kirik_veya_bozuk_olmasi', label: 'Zeminin kırık veya bozuk olması' }
      ];

    case 'yiyecek_icecek_hizmetleri':
      return [
        baseOption,
        { value: 'bos_tepsilerin_zamaninda_alinmamasi', label: 'Boş tepsilerin zamanında alınmaması' },
        { value: 'egitim_eksikligi_nedeniyle_hatali_servis_yapilmasi', label: 'Eğitim eksikliği nedeniyle hatalı servis yapılması' },
        { value: 'gidalarin_son_kullanma_tarihlerinin_gecmis_olmasi', label: 'Gıdaların son kullanma tarihlerinin geçmiş olması' },
        { value: 'guncel_diyet_listesinin_mutfaga_ulasmamasi', label: 'Güncel diyet listesinin mutfağa ulaşmaması' },
        { value: 'hasta_yatagina_yemek_birakilip_kontrol_edilmemesi', label: 'Hasta yatağına yemek bırakılıp kontrol edilmemesi' },
        { value: 'izolasyondaki_hastaya_uygun_onlem_alinmadan_yemek_dagitilmasi', label: 'İzolasyondaki hastaya uygun önlem alınmadan yemek dağıtılması' },
        { value: 'refakatci_yemeginin_gelmemesi', label: 'Refakatçi yemeğinin gelmemesi' },
        { value: 'yemegin_icinden_yabanci_cisim_cikmasi', label: 'Yemeğin içinden yabancı cisim çıkması' },
        { value: 'yemegin_yanlis_gelmesi', label: 'Yemeğin yanlış gelmesi' },
        { value: 'yemek_kaplarinin_veya_tepsilerinin_kirli_olmasi', label: 'Yemek kaplarının veya tepsilerinin kirli olması' },
        { value: 'yemek_lezzetinin_kotu_olmasi', label: 'Yemek lezzetinin kötü olması' },
        { value: 'yemek_seceneginin_az_olmasi', label: 'Yemek seçeneğinin az olması' },
        { value: 'yemek_servisi_sirasinda_tabak_veya_catal_bicak_takimlarinin_kirli_olmasi', label: 'Yemek servisi sırasında tabak veya çatal-bıçak takımlarının kirli olması' },
        { value: 'yemeklerin_gec_gelmesi', label: 'Yemeklerin geç gelmesi' },
        { value: 'yemeklerin_soguk_gelmesi', label: 'Yemeklerin soğuk gelmesi' },
        { value: 'yiyecek_icecek_servisinde_eksiklik_olmasi', label: 'Yiyecek-içecek servisinde eksiklik olması' }
      ];

    case 'kafeterya_hizmetleri':
      return [
        baseOption,
        { value: 'bozulmus_urun_satisi_eksi_kokmus_tarihi_gecmis_urunler', label: 'Bozulmuş ürün satışı (ekşi, kokmuş, tarihi geçmiş ürünler)' },
        { value: 'kafeterya_icinde_kotu_koku_olmasi', label: 'Kafeterya içinde kötü koku olması' },
        { value: 'kafeterya_icindeki_atiklarin_zamaninda_toplanmamasi', label: 'Kafeterya içindeki atıkların zamanında toplanmaması' },
        { value: 'kafeterya_icindeki_cihazlarin_mangal_firin_mikrodalga_vb_arizali_olmasi_veya_bakim_yapilmamasi', label: 'Kafeterya içindeki cihazların (mangal, fırın, mikrodalga vb.) arızalı olması veya bakım yapılmaması' },
        { value: 'kafeterya_personelinin_hijyeninde_yetersizlik_bulunmasi', label: 'Kafeterya personelinin hijyeninde yetersizlik bulunması' },
        { value: 'kafeterya_ucretlerinin_yuksek_olmasi', label: 'Kafeterya ücretlerinin yüksek olması' },
        { value: 'kafeteryada_calisanlarin_kiyafetlerinin_uygun_olmamasi_veya_hijyen_kurallarina_uymamasi', label: 'Kafeteryada çalışanların kıyafetlerinin uygun olmaması veya hijyen kurallarına uymaması' },
        { value: 'kafeteryada_kullanilan_tabak_catal_bardak_gibi_araclarin_kirli_olmasi', label: 'Kafeteryada kullanılan tabak, çatal, bardak gibi araçların kirli olması' },
        { value: 'kafeteryada_yetersiz_personel_bulunmasi', label: 'Kafeteryada yetersiz personel bulunması' },
        { value: 'kafeteryanin_24_saat_acik_olmamasi', label: 'Kafeteryanın 24 saat açık olmaması' },
        { value: 'kafeteryanin_temiz_olmamasi', label: 'Kafeteryanın temiz olmaması' },
        { value: 'mutfak_alaninda_temizlik_eksiklikleri', label: 'Mutfak alanında temizlik eksiklikleri' },
        { value: 'oturma_alaninda_sandalye_veya_masa_kirilmasi_dusme_riski_olmasi', label: 'Oturma alanında sandalye veya masa kırılması, düşme riski olması' },
        { value: 'servisin_gecikmesi', label: 'Servisin gecikmesi' },
        { value: 'sktlerin_ve_uretim_tarihlerinin_etiketlenmemis_olmasi', label: 'SKT\'lerin ve üretim tarihlerinin etiketlenmemiş olması' },
        { value: 'urun_kalitesinin_yetersiz_olmasi', label: 'Ürün kalitesinin yetersiz olması' },
        { value: 'yetersiz_hava_sirkulasyonu_veya_kotu_havalandirma_sistemi_bulunmasi', label: 'Yetersiz hava sirkülasyonu veya kötü havalandırma sistemi bulunması' }
      ];

    case 'guvenlik_hizmetleri':
      return [
        baseOption,
        { value: 'acil_durumlarda_guvenlik_personelinin_gec_mudahale_etmesi', label: 'Acil durumlarda güvenlik personelinin geç müdahale etmesi' },
        { value: 'arac_giris_cikis_kontrolunun_yetersiz_olmasi', label: 'Araç giriş-çıkış kontrolünün yetersiz olması' },
        { value: 'guvenlik_kameralarinin_arizali_veya_kor_noktalar_olusturmasi', label: 'Güvenlik kameralarının arızalı veya kör noktalar oluşturması' },
        { value: 'guvenlik_personelinin_hasta_ve_ziyaretcilere_karsi_uygunsuz_davranisi', label: 'Güvenlik personelinin hasta ve ziyaretçilere karşı uygunsuz davranışı' },
        { value: 'guvenlik_personelinin_gorev_alanini_terk_etmesi', label: 'Güvenlik personelinin görev alanını terk etmesi' },
        { value: 'guvenlik_personelinin_yeterli_bilgilendirme_veya_egitim_almamis_olmasi', label: 'Güvenlik personelinin yeterli bilgilendirme veya eğitim almamış olması' },
        { value: 'guvenlik_noktalarinda_personel_eksikligi', label: 'Güvenlik noktalarında personel eksikliği' },
        { value: 'hastane_girisinde_kimlik_kontrolunun_yapilmamasi', label: 'Hastane girişinde kimlik kontrolünün yapılmaması' },
        { value: 'kimlik_karti_olmayan_kisilerin_kuruma_girisine_izin_verilmesi', label: 'Kimlik kartı olmayan kişilerin kuruma girişine izin verilmesi' },
        { value: 'otopark_veya_hastane_cevresinde_guvenlik_devriyelerinin_yapilmamasi', label: 'Otopark veya hastane çevresinde güvenlik devriyelerinin yapılmaması' },
        { value: 'olay_aninda_gerekli_raporlama_yapilmamasi', label: 'Olay anında gerekli raporlama yapılmaması' },
        { value: 'ziyaretci_karti_veya_bileklik_uygulamasina_uyulmamasi', label: 'Ziyaretçi kartı veya bileklik uygulamasına uyulmaması' },
        { value: 'ziyaretci_saatlerine_uyulmamasi', label: 'Ziyaretçi saatlerine uyulmaması' }
      ];

    case 'otopark_hizmetleri':
      return [
        baseOption,
        { value: 'acil_alanlarin_ambulans_yolu_yangin_cikisi_vb_kapatilmasi', label: 'Acil alanların (ambulans yolu, yangın çıkışı vb.) kapatılması' },
        { value: 'engelli_alanina_izinsiz_park_yapilmasi', label: 'Engelli alanına izinsiz park yapılması' },
        { value: 'otopark_bariyer_veya_otomat_sistemlerinin_arizali_olmasi', label: 'Otopark bariyer veya otomat sistemlerinin arızalı olması' },
        { value: 'otopark_personelinin_uslup_veya_davranis_tarzindan_rahatsizlik_duyulmasi', label: 'Otopark personelinin üslup veya davranış tarzından rahatsızlık duyulması' },
        { value: 'otopark_ya_da_vale_hizmetlerinden_memnun_kalinmamasi', label: 'Otopark ya da vale hizmetlerinden memnun kalınmaması' },
        { value: 'otopark_veya_vale_ucretlerinin_pahali_bulunmasi', label: 'Otopark veya vale ücretlerinin pahalı bulunması' },
        { value: 'otoparkın_ucretli_olmasi', label: 'Otoparkın ücretli olması' },
        { value: 'otoparkta_aracin_hasar_gormesi', label: 'Otoparkta aracın hasar görmesi' },
        { value: 'otoparkta_yer_olmamasi', label: 'Otoparkta yer olmaması' }
      ];

    case 'hastane_guvenligi':
      return [
        baseOption,
        { value: 'acil_durum_ekipmanlarinin_yanlis_yerlestirilmesi_veya_erisiminin_engellenmesi', label: 'Acil durum ekipmanlarının yanlış yerleştirilmesi veya erişiminin engellenmesi' },
        { value: 'acil_durumlarda_kacisin_saglanamamasi', label: 'Acil durumlarda kaçışın sağlanamaması' },
        { value: 'agir_malzemelerin_ust_raflarda_istiflenmesi', label: 'Ağır malzemelerin üst raflarda istiflenmesi' },
        { value: 'atiklarin_kaynaginda_ayristirilmasi_ilkesine_uyulmamasi', label: 'Atıkların kaynağında ayrıştırılması ilkesine uyulmaması' },
        { value: 'banyo_ve_tuvaletlerde_kayma_riskine_karsi_onlem_alinmamasi', label: 'Banyo ve tuvaletlerde kayma riskine karşı önlem alınmaması' },
        { value: 'calisanlarin_kisisel_guvenlik_onlemleri_konusunda_yetersiz_bilgilendirilmesi', label: 'Çalışanların kişisel güvenlik önlemleri konusunda yetersiz bilgilendirilmesi' },
        { value: 'calisanlarin_psikolojik_sagliklarinin_izlenmemesi_ve_bu_konuda_destek_saglanmamasi', label: 'Çalışanların psikolojik sağlıklarının izlenmemesi ve bu konuda destek sağlanmaması' },
        { value: 'calisma_alanlarinda_dolaplarin_sabit_olmamasi', label: 'Çalışma alanlarında dolapların sabit olmaması' },
        { value: 'calisma_alanlarinda_yanici_maddelerin_uygunsuz_sekilde_depolanmasi', label: 'Çalışma alanlarında yanıcı maddelerin uygunsuz şekilde depolanması' },
        { value: 'calisma_alanlarinda_yeterli_aydinlatmanin_bulunmamasi', label: 'Çalışma alanlarında yeterli aydınlatmanın bulunmaması' },
        { value: 'calisma_sandalyelerinin_ergonomi_kosullarina_uygun_olmamasi', label: 'Çalışma sandalyelerinin ergonomi koşullarına uygun olmaması' },
        { value: 'eksik_saglik_ve_guvenlik_isaretlerinin_olmamasi', label: 'Eksik sağlık ve güvenlik işaretlerinin olmaması' },
        { value: 'elektrik_panolarinin_uzerindeki_kablolarin_duzensiz_veya_daginik_olmasi', label: 'Elektrik panolarının üzerindeki kabloların düzensiz veya dağınık olması' },
        { value: 'elektrik_tesisatinin_guvenli_olmayan_sekilde_dosenmesi_ornegin_yanlis_kablo_kullanimi_veya_zayif_baglantilar', label: 'Elektrik tesisatının güvenli olmayan şekilde döşenmesi (örneğin yanlış kablo kullanımı veya zayıf bağlantılar)' },
        { value: 'endustriyel_raf_sistemlerinin_yillik_bakimlarinin_yapilmamasi', label: 'Endüstriyel raf sistemlerinin yıllık bakımlarının yapılmaması' },
        { value: 'ergonomik_kosullarin_yetersiz_olmasi', label: 'Ergonomik koşulların yetersiz olması' },
        { value: 'goz_solusyonunun_bulunmamasi', label: 'Göz solüsyonunun bulunmaması' },
        { value: 'gurultu_seviyesinin_guvenlik_limitlerinin_uzerinde_olmasi', label: 'Gürültü seviyesinin güvenlik limitlerinin üzerinde olması' },
        { value: 'hastane_giris_cikis_guvenliginin_saglanamamasi', label: 'Hastane giriş-çıkış güvenliğinin sağlanamaması' },
        { value: 'isyerinde_yeterli_dinlenme_alanlarinin_olmamasi', label: 'İşyerinde yeterli dinlenme alanlarının olmaması' },
        { value: 'isyerinde_yuksek_sicaklik_veya_soguk_hava_kosullarina_karsi_uygun_onlemlerin_alinmamasi', label: 'İşyerinde yüksek sıcaklık veya soğuk hava koşullarına karşı uygun önlemlerin alınmaması' },
        { value: 'kirik_elektrik_prizlerinin_bulunmasi', label: 'Kırık elektrik prizlerinin bulunması' },
        { value: 'koruyucu_ekipmanlarin_eksik_veya_uygunsuz_kullanilmasi_ornegin_eldiven_koruyucu_gozluk_baret_vb', label: 'Koruyucu ekipmanların eksik veya uygunsuz kullanılması (örneğin eldiven, koruyucu gözlük, baret vb.)' },
        { value: 'makine_ve_ekipmanlarin_koruyucu_muhafazalarinin_eksik_veya_hasarli_olmasi', label: 'Makine ve ekipmanların koruyucu muhafazalarının eksik veya hasarlı olması' },
        { value: 'pasli_ekipmanlarin_alanlarda_bulunmasi', label: 'Paslı ekipmanların alanlarda bulunması' },
        { value: 'raf_sistemlerinin_topraklamalarinin_yapilmamasi', label: 'Raf sistemlerinin topraklamalarının yapılmaması' },
        { value: 'raflarin_sabit_olmamasi', label: 'Rafların sabit olmaması' },
        { value: 'saglik_guvenlik_isaretlerinin_olmamasi_veya_sokulmesi', label: 'Sağlık güvenlik işaretlerinin olmaması veya sökülmesi' },
        { value: 'siginaklarin_uygun_olarak_kullanilmamasi', label: 'Sığınakların uygun olarak kullanılmaması' },
        { value: 'su_depolarinda_kapaklarin_kilitsiz_olmasi', label: 'Su depolarında kapakların kilitsiz olması' },
        { value: 'su_depolarinda_uygunsuz_konumlandirilan_elektrik_panolarinin_bulunmasi', label: 'Su depolarında uygunsuz konumlandırılan elektrik panolarının bulunması' },
        { value: 'su_depolarinin_temizliginin_veya_kontrollerinin_yapilmamis_olmasi', label: 'Su depolarının temizliğinin veya kontrollerinin yapılmamış olması' },
        { value: 'yangin_tatbikatlarinin_veya_acil_durum_simulasyonlarinin_yapilmamasi', label: 'Yangın tatbikatlarının veya acil durum simülasyonlarının yapılmaması' }
      ];

    case 'gostergelerin_izlenmesi':
      return [
        baseOption,
        { value: 'veri_toplama_eksikligi', label: 'Veri Toplama Eksikliği' },
        { value: 'analiz_yetersizligi', label: 'Analiz Yetersizliği' },
        { value: 'raporlama_gecikme', label: 'Raporlama Gecikme' },
        { value: 'hedef_sapma', label: 'Hedef Sapma' }
      ];

    case 'veri_analiz_sonuclari':
      return [
        baseOption,
        { value: 'veri_kalitesi', label: 'Veri Kalitesi' },
        { value: 'analiz_yontemi', label: 'Analiz Yöntemi' },
        { value: 'raporlama_formati', label: 'Raporlama Formatı' },
        { value: 'trend_analizi', label: 'Trend Analizi' }
      ];

    default:
      return [baseOption];
  }
};

export const DOFWizard: React.FC<DOFWizardProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useAuth();
  const { locations } = useDofLocations();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tespit_tarihi: new Date().toISOString().split('T')[0],
    dof_turu: 'duzeltici' as const,
    tespit_edilen_bolum: '',
    dof_kaynagi: '',
    dof_kategorisi: '',
    kisa_aciklama: '',
    dofu_acan: user?.display_name || '',
    sorumlu_bolum: '',
    tanim: '',
    priority: 'orta' as const,
    facility_id: user?.facility_id || 1
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.tespit_tarihi) newErrors.tespit_tarihi = 'Tespit tarihi gereklidir';
        if (!formData.dof_turu) newErrors.dof_turu = 'DÖF türü seçiniz';
        if (!formData.tespit_edilen_bolum) newErrors.tespit_edilen_bolum = 'Tespit edilen bölüm seçiniz';
        break;
      case 2:
        if (!formData.dof_kaynagi) newErrors.dof_kaynagi = 'DÖF kaynağı seçiniz';
        if (!formData.dof_kategorisi) newErrors.dof_kategorisi = 'DÖF kategorisi seçiniz';
        if (!formData.kisa_aciklama) newErrors.kisa_aciklama = 'Kısa açıklama seçiniz';
        break;
      case 3:
        if (!formData.sorumlu_bolum) newErrors.sorumlu_bolum = 'Sorumlu bölüm seçiniz';
        break;
      case 4:
        if (!formData.tanim.trim()) newErrors.tanim = 'Detaylı açıklama gereklidir';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      await onSubmit({
        title: `${formData.dof_kategorisi} - ${formData.kisa_aciklama}`,
        description: formData.tanim,
        priority: formData.priority,
        dof_turu: formData.dof_turu,
        facility_id: formData.facility_id,
        tespit_edilen_yer: formData.tespit_edilen_bolum,
        tespit_tarihi: formData.tespit_tarihi,
        dof_kaynagi: formData.dof_kaynagi,
        dof_kategorisi: formData.dof_kategorisi,
        kisa_aciklama: formData.kisa_aciklama,
        sorumlu_bolum: formData.sorumlu_bolum,
        reporter_id: user?.id || 'unknown',
        organization_id: user?.organization_id,
        status: 'atanmayı_bekleyen'
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };



  // Options for dropdowns
  const dofTuruOptions = [
    { value: 'duzeltici', label: 'Düzeltici Faaliyet' },
    { value: 'onleyici', label: 'Önleyici Faaliyet' }
  ];

  const tespitEdilenBolumOptions = [
    { value: '', label: 'Bölüm Seçiniz' },
    ...locations.map(loc => ({ value: loc.value, label: loc.label }))
  ];

  const dofKategorisiOptions = [
    { value: 'atik_yonetimi', label: 'Atık Yönetimi' },
    { value: 'cihaz_ve_ekipman', label: 'Cihaz ve Ekipman' },
    { value: 'cagri_merkezi_hizmeti', label: 'Çağrı Merkezi Hizmeti' },
    { value: 'calisanlarin_tutum_ve_davranislari', label: 'Çalışanların Tutum ve Davranışları' },
    { value: 'dokuman_yonetimi', label: 'Doküman Yönetimi' },
    { value: 'enfeksiyon_kontrol', label: 'Enfeksiyon Kontrol' },
    { value: 'gostergelerin_izlenmesi', label: 'Göstergelerin İzlenmesi' },
    { value: 'guvenlik_hizmetleri', label: 'Güvenlik Hizmetleri' },
    { value: 'hasta_guvenligi', label: 'Hasta Güvenliği' },
    { value: 'hasta_guvenligi_mahremiyeti', label: 'Hasta Güvenliği / Mahremiyeti' },
    { value: 'hasta_mahremiyeti_ve_tibbi_kayitlar', label: 'Hasta Mahremiyeti ve Tıbbi Kayıtlar' },
    { value: 'hastane_donanimi_ve_fiziksel_sorunlar', label: 'Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar' },
    { value: 'hastane_guvenligi', label: 'Hastane Güvenliği' },
    { value: 'ilac_guvenligi', label: 'İlaç Güvenliği' },
    { value: 'kafeterya_hizmetleri', label: 'Kafeterya Hizmetleri' },
    { value: 'laboratuvar_ve_radyoloji_hizmetleri', label: 'Laboratuvar ve Radyoloji Hizmetleri' },
    { value: 'otopark_hizmetleri', label: 'Otopark Hizmetleri' },
    { value: 'personel_yonetimi', label: 'Personel Yönetimi' },
    { value: 'randevu_hizmetleri', label: 'Randevu Hizmetleri' },
    { value: 'tani_ve_tedavi_hizmetleri', label: 'Tanı ve Tedavi Hizmetleri' },
    { value: 'temizlik_yonetimi', label: 'Temizlik Yönetimi' },
    { value: 'ucretlendirme_ve_faturalama_hizmetleri', label: 'Ücretlendirme ve Faturalama Hizmetleri' },
    { value: 'veri_analiz_sonuclari', label: 'Veri Analiz Sonuçları' },
    { value: 'yangin_guvenligi', label: 'Yangın Güvenliği' },
    { value: 'yatis_ve_taburculuk_islemleri', label: 'Yatış ve Taburculuk İşlemleri' },
    { value: 'yiyecek_icecek_hizmetleri', label: 'Yiyecek-İçecek Hizmetleri' }
  ];

  const sorumluBolumOptions = [
    { value: '', label: 'Sorumlu Bölüm Seçiniz' },
    { value: 'kalite_yonetimi', label: 'Kalite Yönetimi' },
    { value: 'hasta_guvenlik', label: 'Hasta Güvenlik Komitesi' },
    { value: 'enfeksiyon_kontrol', label: 'Enfeksiyon Kontrol Komitesi' },
    { value: 'teknik_hizmetler', label: 'Teknik Hizmetler' },
    { value: 'insan_kaynaklari', label: 'İnsan Kaynakları' },
    { value: 'tibbi_hizmetler', label: 'Tıbbi Hizmetler' },
    { value: 'idari_hizmetler', label: 'İdari Hizmetler' }
  ];

  // Dinamik kısa açıklama seçenekleri
  const kisaAciklamaOptions = getKisaAciklamaOptions(formData.dof_kategorisi);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-calendar-check text-2xl text-primary-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Temel Bilgiler</h3>
              <p className="text-secondary-600">DÖF tespit tarihi, türü ve bölümü belirleyin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="DÖF Tespit Tarihi"
                type="date"
                value={formData.tespit_tarihi}
                onChange={(e) => setFormData({ ...formData, tespit_tarihi: e.target.value })}
                error={errors.tespit_tarihi}
              />

              <Select
                label="DÖF Türü"
                value={formData.dof_turu}
                onChange={(e) => setFormData({ ...formData, dof_turu: e.target.value as 'duzeltici' | 'onleyici' })}
                options={dofTuruOptions as any}
                error={errors.dof_turu}
              />
            </div>

            <Select
              label="DÖF Tespit Edilen Bölüm"
              value={formData.tespit_edilen_bolum}
              onChange={(e) => setFormData({ ...formData, tespit_edilen_bolum: e.target.value })}
              options={tespitEdilenBolumOptions}
              error={errors.tespit_edilen_bolum}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-tags text-2xl text-warning-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Kaynak ve Kategori</h3>
              <p className="text-secondary-600">DÖF kaynağı, kategorisi ve kısa açıklamasını belirleyin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="DÖF Kaynağı"
                value={formData.dof_kaynagi}
                onChange={(e) => setFormData({ ...formData, dof_kaynagi: e.target.value })}
                options={dofKaynagiOptions}
                error={errors.dof_kaynagi}
              />

              <Select
                label="DÖF Kategorisi"
                value={formData.dof_kategorisi}
                onChange={(e) => setFormData({
                  ...formData,
                  dof_kategorisi: e.target.value,
                  kisa_aciklama: '' // Reset kısa açıklama when category changes
                })}
                options={dofKategorisiOptions}
                error={errors.dof_kategorisi}
              />
            </div>

            <Select
              label="Kısa Açıklama"
              value={formData.kisa_aciklama}
              onChange={(e) => setFormData({ ...formData, kisa_aciklama: e.target.value })}
              options={kisaAciklamaOptions}
              error={errors.kisa_aciklama}
              disabled={!formData.dof_kategorisi}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-person-check text-2xl text-success-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Sorumluluk Ataması</h3>
              <p className="text-secondary-600">DÖF'ü açan kişi ve sorumlu bölümü belirleyin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="DÖF'ü Açan"
                value={formData.dofu_acan}
                disabled
                className="bg-secondary-50"
              />

              <Select
                label="Sorumlu Bölüm"
                value={formData.sorumlu_bolum}
                onChange={(e) => setFormData({ ...formData, sorumlu_bolum: e.target.value })}
                options={sorumluBolumOptions}
                error={errors.sorumlu_bolum}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-file-text text-2xl text-accent-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Detaylar ve Dosyalar</h3>
              <p className="text-secondary-600">Detaylı açıklama yazın ve gerekli dosyaları ekleyin</p>
            </div>

            <Textarea
              label="DÖF Detaylı Tanımı"
              value={formData.tanim}
              onChange={(e) => setFormData({ ...formData, tanim: e.target.value })}
              error={errors.tanim}
              placeholder="Problemin detaylı açıklamasını, nasıl tespit edildiğini ve etkilerini yazın..."
              rows={6}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Dosya Ekleme
              </label>
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="bi bi-cloud-upload text-xl text-primary-600"></i>
                  </div>
                  <p className="text-secondary-700 font-medium mb-1">Dosyaları buraya sürükleyin</p>
                  <p className="text-sm text-secondary-500">veya dosya seçmek için tıklayın</p>
                  <p className="text-xs text-secondary-400 mt-2">PDF, DOC, JPG, PNG (Max 10MB)</p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-secondary-700">Seçilen Dosyalar:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center">
                        <i className="bi bi-file-earmark mr-3 text-secondary-600"></i>
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{file.name}</p>
                          <p className="text-xs text-secondary-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        className="text-danger-600 hover:text-danger-700 p-1"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-check-circle text-2xl text-success-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Bilgileri Kontrol Edin</h3>
              <p className="text-secondary-600">DÖF bilgilerini gözden geçirin ve onaylayın</p>
            </div>

            <div className="bg-secondary-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Tespit Tarihi</label>
                  <p className="text-secondary-900">{new Date(formData.tespit_tarihi).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">DÖF Türü</label>
                  <p className="text-secondary-900">{formData.dof_turu === 'duzeltici' ? 'Düzeltici Faaliyet' : 'Önleyici Faaliyet'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Tespit Edilen Bölüm</label>
                  <p className="text-secondary-900">{tespitEdilenBolumOptions.find(opt => opt.value === formData.tespit_edilen_bolum)?.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Kaynak</label>
                  <p className="text-secondary-900">{dofKaynagiOptions.find(opt => opt.value === formData.dof_kaynagi)?.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Kategori</label>
                  <p className="text-secondary-900">{dofKategorisiOptions.find(opt => opt.value === formData.dof_kategorisi)?.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Sorumlu Bölüm</label>
                  <p className="text-secondary-900">{sorumluBolumOptions.find(opt => opt.value === formData.sorumlu_bolum)?.label}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-600">Kısa Açıklama</label>
                <p className="text-secondary-900">{kisaAciklamaOptions.find(opt => opt.value === formData.kisa_aciklama)?.label}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-600">Detaylı Tanım</label>
                <p className="text-secondary-900 whitespace-pre-wrap">{formData.tanim}</p>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-secondary-600">Eklenen Dosyalar</label>
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <p key={index} className="text-sm text-secondary-700">
                        <i className="bi bi-file-earmark mr-2"></i>
                        {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {wizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= step.id
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-secondary-300 text-secondary-400'
                }`}>
                {currentStep > step.id ? (
                  <i className="bi bi-check text-sm"></i>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < wizardSteps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-all ${currentStep > step.id ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-secondary-900">
            {wizardSteps[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-secondary-600">
            Adım {currentStep} / {wizardSteps.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-secondary-200 p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={loading}
            >
              <i className="bi bi-arrow-left mr-2"></i>
              Önceki
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            İptal
          </Button>

          {currentStep < wizardSteps.length ? (
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              Sonraki
              <i className="bi bi-arrow-right ml-2"></i>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-success-600 hover:bg-success-700"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg mr-2"></i>
                  DÖF'ü Kaydet
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
