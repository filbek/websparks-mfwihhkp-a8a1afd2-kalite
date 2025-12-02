/*
  # Hasta Güvenliği Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Hasta Güvenliği kategorisi için Excel'den alınan güncel 68 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 68 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'hasta_guvenligi';

-- Yeni Hasta Güvenliği kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_guvenligi', 'acil_aktivasyon_kayit_eksik', 'Acil durum aktivasyon kayıtlarının olmaması/eksik olması', 1, true),
  ('hasta_guvenligi', 'acil_ekip_gec', 'Acil durum ekibinin geç gelmesi', 2, true),
  ('hasta_guvenligi', 'acil_kod_bilinmiyor', 'Acil durum kodlarının bilinmemesi', 3, true),
  ('hasta_guvenligi', 'acil_kod_aktivasyon_uygunsuz', 'Acil durum kodlarının uygun olarak aktive edilmemesi', 4, true),
  ('hasta_guvenligi', 'acil_set_stok_uyumsuz', 'Acil müdahale seti içinde bulunan ilaç ve malzemelerin stok seviyelerindeki uyumsuzluk bulunması.', 5, true),
  ('hasta_guvenligi', 'afet_plan_bilinmiyor', 'Afet eylem planının bilinmemesi', 6, true),
  ('hasta_guvenligi', 'agiz_bakim_yetersiz', 'Ağız bakımı ve takibi yetersizliği.', 7, true),
  ('hasta_guvenligi', 'agri_degerlendirme_eksik', 'Ağrı şiddeti değerlendirmesi eksikliği.', 8, true),
  ('hasta_guvenligi', 'ameliyat_protez_teslim_eksik', 'Ameliyat öncesi hastaya ait çıkarılabilen protezlerin ve değerli eşyaların teslimi ile ilgili süreç lerdeki eksiklik.', 9, true),
  ('hasta_guvenligi', 'bakim_hedef_yok', 'Bakım ihtiyaçlarına yönelik hedeflerin belirlenmemiş olması.', 10, true),
  ('hasta_guvenligi', 'bakim_teshis_tedavi_hata', 'Bakım,Teşhis ve Tedavi Sürecine ilişkin Hatalar.', 11, true),
  ('hasta_guvenligi', 'basi_ulser_risk_eksik', 'Bası ülseri risk değerlendirmesinin eksikliği.', 12, true),
  ('hasta_guvenligi', 'beslenme_degerlendirme_yok', 'Beslenme durumunun değerlendirilmemesi.', 13, true),
  ('hasta_guvenligi', 'onam_form_eksik', 'Bilgilendirilmiş Onam Formunun Eksik Doldurulması', 14, true),
  ('hasta_guvenligi', 'bina_sigara', 'Bina dahilinde sigara içilmesi', 15, true),
  ('hasta_guvenligi', 'bolum_risk_tanimsiz', 'Bölüme özgü risklerin tanımlanmaması', 16, true),
  ('hasta_guvenligi', 'cerrahi_isaretleme_yok', 'Cerrahi işaretlemenin yapılmamış olması', 17, true),
  ('hasta_guvenligi', 'calisan_acil_bilgi_yetersiz', 'Çalışanların acil durum kodlarında müdahalede yapılacaklar konusunda yetersiz bilgilerinin olması', 18, true),
  ('hasta_guvenligi', 'dusme_risk_degerlendirme_yok', 'Düşme riski değerlendirmesinin yapılmamış olması.', 19, true),
  ('hasta_guvenligi', 'eczane_yanlis_ilac', 'Eczaneden yanlış ilaç gönderimi olması', 20, true),
  ('hasta_guvenligi', 'nabiz_odem_takip_eksik', 'Ekstremite nabız takibi ve ödem derecelendirmesi eksikliği.', 21, true),
  ('hasta_guvenligi', 'el_hijyen_5_endikasyon_uyumsuz', 'El hijyeninde 5 endikasyonuna uyulmaması', 22, true),
  ('hasta_guvenligi', 'glukometre_kontrol_yok', 'Glukometrenin günlük kontrolünün yapılmaması', 23, true),
  ('hasta_guvenligi', 'hasta_bileklik_yok', 'Hasta bilekliği takılmadan yönlendirme yapılması', 24, true),
  ('hasta_guvenligi', 'damar_yolu_bilgi_yok', 'Hasta damar yolu açılış bilgilerinin yazılmaması', 25, true),
  ('hasta_guvenligi', 'dusme_onlem_yok', 'Hasta düşme risk önlemlerinin alınmamış olması', 26, true),
  ('hasta_guvenligi', 'hasta_dusme', 'Hasta Düşmesi', 27, true),
  ('hasta_guvenligi', 'guvenlik_hedef_uygulanmiyor', 'Hasta güvenliği hedeflerinin uygulanmaması', 28, true),
  ('hasta_guvenligi', 'kol_bandi_bilgi_hatali', 'Hasta kol bandı üzerindeki bilgilerin hatalı/eksik olması', 29, true),
  ('hasta_guvenligi', 'oda_numara_kullanim', 'Hasta oda numaralarının kullanılması', 30, true),
  ('hasta_guvenligi', 'koter_yanigi', 'Hastada Koter Yanığı Oluşması', 31, true),
  ('hasta_guvenligi', 'giris_kontrol_yok', 'Hastaneye girişlerin kontrol edilememesi', 32, true),
  ('hasta_guvenligi', 'ameliyat_hazirlik_eksik', 'Hastanın Eksik Hazırlıkla Ameliyathaneye Teslim Edilmesi', 33, true),
  ('hasta_guvenligi', 'transfer_saglik_calisani_yok', 'Hastanın transferi bir sağlık çalışanı eşliğinde gerçekleştirilmemesi.', 34, true),
  ('hasta_guvenligi', 'hasta_bilgilendirme_yok', 'Hastaya gerekli bilgilendirmenin yapılmaması', 35, true),
  ('hasta_guvenligi', 'yanlis_ilac', 'Hastaya yanlış ilaç verilmesi', 36, true),
  ('hasta_guvenligi', 'yanlis_kan', 'Hastaya yanlış kan verilmesi', 37, true),
  ('hasta_guvenligi', 'yanlis_rapor', 'Hastaya yanlış rapor yada sonucun verilmesi', 38, true),
  ('hasta_guvenligi', 'yanlis_recete', 'Hastaya yanlış reçete verilmesi', 39, true),
  ('hasta_guvenligi', 'hemfire_cagri_anlatilmamis', 'Hemşire çağrı sistemi kullanımı kullanımının hastaya anlatılmamış olması.', 40, true),
  ('hasta_guvenligi', 'ilac_etiket_hatali', 'İlaç etiketindeki bilgilerin hatalı olması', 41, true),
  ('hasta_guvenligi', 'ilac_etiket_yok', 'İlaç etiketlemenin yapılmamış olması', 42, true),
  ('hasta_guvenligi', 'ilac_etiket_uygunsuz', 'İlaç etiketlerinin uygunsuz yapıştırılmış olması', 43, true),
  ('hasta_guvenligi', 'ilac_vital_takip_yetersiz', 'İlaç uygulamaları ve operasyon sonrası hasta vital bulgularının takibinin yetersizliği.', 44, true),
  ('hasta_guvenligi', 'kan_transfuzyon_prosedur_uyumsuz', 'Kan transfüzyon prosedürüne uyulmaması', 45, true),
  ('hasta_guvenligi', 'kan_transfuzyon_hata', 'Kan ve kan ürünlerinin Transfüzyonuna İlişkin Hatalar', 46, true),
  ('hasta_guvenligi', 'kaygan_zemin_uyari_yok', 'Kaygan zemin uyarı görselinin bulunmaması', 47, true),
  ('hasta_guvenligi', 'kimlik_dogrulama_yok', 'Kimlik doğrulamasının yapılmamaış olması', 48, true),
  ('hasta_guvenligi', 'kimyasal_envanter_yok', 'Kimyasal madde envanter listesinin bulunmaması', 49, true),
  ('hasta_guvenligi', 'kol_bileklik_okunamaz', 'Kol bileklikleri üzerinde yer alan kimlik bilgilerinin okunaklı olmaması.', 50, true),
  ('hasta_guvenligi', 'konsultasyon_etkin_degil', 'Konsültasyon süreçlerinin etkin şekilde yürütülmemesi .', 51, true),
  ('hasta_guvenligi', 'su_isiticisi_kontrolsuz', 'Kontrolsüz su ısıtıcılarının kullanılması', 52, true),
  ('hasta_guvenligi', 'kroki_guncel_degil', 'Krokilerin  güncel olmaması', 53, true),
  ('hasta_guvenligi', 'gaz_tupu_sabit_degil', 'Medikal gaz tüplerinin sabitlenmemiş olması', 54, true),
  ('hasta_guvenligi', 'numune_kayip', 'Numunenin kaybolması', 55, true),
  ('hasta_guvenligi', 'numune_etiket_hatali', 'Numunenin yanlış ya da eksik etiketlenmesi', 56, true),
  ('hasta_guvenligi', 'priz_cocuk_koruma_yok', 'Prizlerde çocuk korumasının olmaması', 57, true),
  ('hasta_guvenligi', 'kateter_uyari_yok', 'Sağlık çalışanlarını bilgilendirmek amacıyla hastalara takılan yüksek riskli kateterlere (arteriyel, epidural, intratekal gibi) yönelik uyarıcı işaretleme yapılmamış olması.', 58, true),
  ('hasta_guvenligi', 'sharp_box_sabit_degil', 'Sharp-boxların sabitlenmemiş olması', 59, true),
  ('hasta_guvenligi', 'sinalizasyon_eksik', 'Sinalizasyonun eksik/hatalı olması', 60, true),
  ('hasta_guvenligi', 'skt_kontrol_yok', 'SKT Kontrolünün yapılmaması', 61, true),
  ('hasta_guvenligi', 'tatbikat_yok', 'Tatbikatların yapılmamış olması', 62, true),
  ('hasta_guvenligi', 'tavan_depolama', 'Tavana değen depolama yapılması', 63, true),
  ('hasta_guvenligi', 'teknik_mahal_kilitsiz', 'Teknik mahallerin kilitli olmaması', 64, true),
  ('hasta_guvenligi', 'tiraban_yukseklik_yetersiz', 'Tırabzan yüksekliklerinin yeterli olmaması', 65, true),
  ('hasta_guvenligi', 'yanlis_bolge_cerrahi', 'Yanlış bölge/alan cerrahisi olması', 66, true),
  ('hasta_guvenligi', 'yanlis_hasta_cerrahi', 'Yanlış hastaya cerrahi müdahale yapılması', 67, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
