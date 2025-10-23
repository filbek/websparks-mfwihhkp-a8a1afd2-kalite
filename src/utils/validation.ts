// Email validasyonu
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Genel email formatı kontrolü
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Sadece anadoluhastaneleri.com uzantısını kabul et
  return email.endsWith('@anadoluhastaneleri.com');
};

// Form validasyon fonksiyonları
export const validateFeedbackForm = (formData: any) => {
  const errors: Record<string, string> = {};
  
  if (!formData.title?.trim()) {
    errors.title = 'Başlık alanı zorunludur';
  }
  
  if (!formData.content?.trim()) {
    errors.content = 'İçerik alanı zorunludur';
  }
  
  if (!formData.category_id) {
    errors.category_id = 'Kategori seçimi zorunludur';
  }
  
  // Anonim ise iletişim bilgileri kontrolü
  if (formData.is_anonymous) {
    if (!formData.reporter_name?.trim()) {
      errors.reporter_name = 'Ad alanı zorunludur';
    }
    
    if (!formData.reporter_email?.trim() && !formData.reporter_phone?.trim()) {
      errors.contact = 'E-posta veya telefon numarası girilmelidir';
    } else if (formData.reporter_email?.trim() && !isValidEmail(formData.reporter_email)) {
      errors.reporter_email = 'Geçerli bir anadoluhastaneleri.com e-posta adresi giriniz';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Telefon numarası validasyonu
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?\s?(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/;
  return phoneRegex.test(phone);
};

// Kullanıcı adı validasyonu
export const isValidUserName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};