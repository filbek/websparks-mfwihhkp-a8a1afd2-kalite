import * as XLSX from 'xlsx';
import { User } from '../types';
import { generateSecurePassword } from './passwordUtils';

export interface UserImportData {
  email: string;
  display_name: string;
  role: string;
  facility_id: number;
  department_name?: string;
  is_active: boolean;
}

export interface UserImportResult {
  success: boolean;
  data?: UserImportData[];
  errors: string[];
  warnings: string[];
}

export interface ImportedUserWithPassword extends UserImportData {
  generatedPassword: string;
}

export const exportUsersToExcel = (users: User[], facilities: Map<number, string>): void => {
  const exportData = users.map(user => ({
    'E-posta': user.email,
    'Ad Soyad': user.display_name,
    'Rol': user.role.join(', '),
    'Şube ID': user.facility_id,
    'Şube Adı': facilities.get(user.facility_id) || 'Bilinmeyen',
    'Departman': user.department_name || '',
    'Durum': user.is_active ? 'Aktif' : 'Pasif',
    'Oluşturulma Tarihi': new Date(user.created_at).toLocaleString('tr-TR')
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kullanıcılar');

  const columnWidths = [
    { wch: 35 },
    { wch: 25 },
    { wch: 25 },
    { wch: 10 },
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 20 }
  ];
  worksheet['!cols'] = columnWidths;

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `kullanicilar_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

export const generateImportTemplate = (): void => {
  const templateData = [
    {
      'E-posta': 'ornek@anadoluhastaneleri.com',
      'Ad Soyad': 'Örnek Kullanıcı',
      'Rol': 'personel',
      'Şube ID': 1,
      'Departman': 'Kalite Yönetimi',
      'Durum': 'Aktif'
    },
    {
      'E-posta': 'admin@anadoluhastaneleri.com',
      'Ad Soyad': 'Admin Kullanıcı',
      'Rol': 'admin',
      'Şube ID': 1,
      'Departman': 'Yönetim',
      'Durum': 'Aktif'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kullanıcı Şablonu');

  const columnWidths = [
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 20 },
    { wch: 10 }
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.sheet_add_aoa(worksheet, [['NOT: Rol değerleri: personel, sube_kalite, merkez_kalite, admin']], { origin: 'A4' });
  XLSX.utils.sheet_add_aoa(worksheet, [['Durum değerleri: Aktif veya Pasif']], { origin: 'A5' });

  XLSX.writeFile(workbook, 'kullanici_import_sablonu.xlsx');
};

export const parseImportFile = async (file: File): Promise<UserImportResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    if (workbook.SheetNames.length === 0) {
      errors.push('Excel dosyası boş veya geçersiz');
      return { success: false, errors, warnings };
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      errors.push('Excel dosyasında veri bulunamadı');
      return { success: false, errors, warnings };
    }

    const users: UserImportData[] = [];
    const emailSet = new Set<string>();

    jsonData.forEach((row: any, index: number) => {
      const rowNumber = index + 2;
      const rowErrors: string[] = [];

      const email = row['E-posta']?.toString().trim().toLowerCase();
      const display_name = row['Ad Soyad']?.toString().trim();
      const role = row['Rol']?.toString().trim().toLowerCase();
      const facility_id = parseInt(row['Şube ID']?.toString());
      const department_name = row['Departman']?.toString().trim();
      const is_active = row['Durum']?.toString().trim().toLowerCase() === 'aktif';

      if (!email) {
        rowErrors.push(`Satır ${rowNumber}: E-posta adresi eksik`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push(`Satır ${rowNumber}: Geçersiz e-posta formatı`);
      } else if (emailSet.has(email)) {
        rowErrors.push(`Satır ${rowNumber}: Duplicate e-posta (${email})`);
      }

      if (!display_name) {
        rowErrors.push(`Satır ${rowNumber}: Ad Soyad eksik`);
      }

      const validRoles = ['personel', 'sube_kalite', 'merkez_kalite', 'admin'];
      if (!role) {
        rowErrors.push(`Satır ${rowNumber}: Rol eksik`);
      } else if (!validRoles.includes(role)) {
        rowErrors.push(`Satır ${rowNumber}: Geçersiz rol (${role}). Geçerli değerler: ${validRoles.join(', ')}`);
      }

      if (!facility_id || isNaN(facility_id)) {
        rowErrors.push(`Satır ${rowNumber}: Şube ID eksik veya geçersiz`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        emailSet.add(email);
        users.push({
          email,
          display_name,
          role,
          facility_id,
          department_name: department_name || undefined,
          is_active
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    if (users.length === 0) {
      errors.push('İçe aktarılacak geçerli kullanıcı bulunamadı');
      return { success: false, errors, warnings };
    }

    return { success: true, data: users, errors: [], warnings };

  } catch (error) {
    errors.push(`Dosya okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    return { success: false, errors, warnings };
  }
};

export const generatePasswordsForImport = (users: UserImportData[]): ImportedUserWithPassword[] => {
  return users.map(user => ({
    ...user,
    generatedPassword: generateSecurePassword(12)
  }));
};

export const exportPasswordsToExcel = (usersWithPasswords: ImportedUserWithPassword[]): void => {
  const exportData = usersWithPasswords.map(user => ({
    'E-posta': user.email,
    'Ad Soyad': user.display_name,
    'Şifre': user.generatedPassword,
    'Rol': user.role,
    'Şube ID': user.facility_id,
    'Departman': user.department_name || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kullanıcı Şifreleri');

  const columnWidths = [
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 20 }
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.sheet_add_aoa(worksheet, [['ÖNEMLİ: Bu dosyayı güvenli bir yerde saklayın ve kullanıcılara şifrelerini güvenli şekilde iletin.']], { origin: 'A' + (exportData.length + 3) });

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `kullanici_sifreleri_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
