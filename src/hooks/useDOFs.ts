import { useState, useEffect } from 'react';
import { DOF } from '../types';

// Mock data for development
const mockDOFs: DOF[] = [
  {
    id: '1',
    title: 'Hasta Düşme Olayı - Acil Servis',
    description: 'Acil serviste hasta düşme olayı meydana geldi. Güvenlik önlemleri gözden geçirilmeli.',
    facility_id: 1,
    reporter_id: 'user-1',
    assigned_to: 'user-2',
    status: 'atanan',
    priority: 'yüksek',
    due_date: '2024-02-15T00:00:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    facility: { id: 1, name: 'Silivri Şubesi', code: 'SLV', address: 'Silivri', phone: '0212-123-4567', created_at: '2024-01-01T00:00:00Z' },
    reporter: { id: 'user-1', email: 'mehmet@hospital.com', display_name: 'Dr. Mehmet Yılmaz', role: ['personel'], facility_id: 1, department_id: 1, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    assignee: { id: 'user-2', email: 'ayse@hospital.com', display_name: 'Ayşe Kaya', role: ['sube_kalite'], facility_id: 1, department_id: 2, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: '2',
    title: 'İlaç Hata Bildirimi',
    description: 'Yanlış ilaç dozajı uygulandı. İlaç güvenlik protokolleri gözden geçirilmeli.',
    facility_id: 2,
    reporter_id: 'user-3',
    assigned_to: null,
    status: 'atanmayi_bekleyen',
    priority: 'kritik',
    due_date: null,
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T09:15:00Z',
    facility: { id: 2, name: 'Avcılar Şubesi', code: 'AVC', address: 'Avcılar', phone: '0212-234-5678', created_at: '2024-01-01T00:00:00Z' },
    reporter: { id: 'user-3', email: 'fatma@hospital.com', display_name: 'Fatma Demir', role: ['personel'], facility_id: 2, department_id: 3, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: '3',
    title: 'Enfeksiyon Kontrol Eksikliği',
    description: 'El hijyeni protokollerinde eksiklik tespit edildi. Personel eğitimi gerekli.',
    facility_id: 3,
    reporter_id: 'user-4',
    assigned_to: 'user-5',
    status: 'kapatma_onayinda',
    priority: 'orta',
    due_date: '2024-02-01T00:00:00Z',
    created_at: '2024-01-14T16:45:00Z',
    updated_at: '2024-01-18T11:30:00Z',
    facility: { id: 3, name: 'Ereğli Şubesi', code: 'ERE', address: 'Ereğli', phone: '0372-345-6789', created_at: '2024-01-01T00:00:00Z' },
    reporter: { id: 'user-4', email: 'ali@hospital.com', display_name: 'Ali Özkan', role: ['personel'], facility_id: 3, department_id: 4, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    assignee: { id: 'user-5', email: 'zeynep@hospital.com', display_name: 'Zeynep Arslan', role: ['sube_kalite'], facility_id: 3, department_id: 5, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: '4',
    title: 'Tıbbi Cihaz Arızası',
    description: 'Yoğun bakım ünitesinde monitör arızası. Acil bakım gerekli.',
    facility_id: 1,
    reporter_id: 'user-6',
    assigned_to: 'user-7',
    status: 'cozum_bekliyor',
    priority: 'yüksek',
    due_date: '2024-01-25T00:00:00Z',
    created_at: '2024-01-17T08:20:00Z',
    updated_at: '2024-01-17T14:10:00Z',
    facility: { id: 1, name: 'Silivri Şubesi', code: 'SLV', address: 'Silivri', phone: '0212-123-4567', created_at: '2024-01-01T00:00:00Z' },
    reporter: { id: 'user-6', email: 'can@hospital.com', display_name: 'Can Yıldız', role: ['personel'], facility_id: 1, department_id: 6, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    assignee: { id: 'user-7', email: 'selin@hospital.com', display_name: 'Selin Kara', role: ['sube_kalite'], facility_id: 1, department_id: 7, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: '5',
    title: 'Doküman Güncelleme Gereksinimi',
    description: 'Ameliyathane prosedürleri güncellenmelidir. Yeni standartlara uyum sağlanmalı.',
    facility_id: 2,
    reporter_id: 'user-8',
    assigned_to: null,
    status: 'yeni',
    priority: 'düşük',
    due_date: null,
    created_at: '2024-01-18T13:45:00Z',
    updated_at: '2024-01-18T13:45:00Z',
    facility: { id: 2, name: 'Avcılar Şubesi', code: 'AVC', address: 'Avcılar', phone: '0212-234-5678', created_at: '2024-01-01T00:00:00Z' },
    reporter: { id: 'user-8', email: 'murat@hospital.com', display_name: 'Murat Şen', role: ['personel'], facility_id: 2, department_id: 8, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  }
];

export const useDOFs = () => {
  const [dofs, setDofs] = useState<DOF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDOFs = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      setDofs(mockDOFs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createDOF = async (dofData: Partial<DOF>) => {
    try {
      // Simulate API call
      await new Promise(resolve => window.setTimeout(resolve, 500));
      
      const newDOF: DOF = {
        id: Date.now().toString(),
        title: dofData.title || 'Yeni DÖF',
        description: dofData.description || '',
        facility_id: dofData.facility_id || 1,
        reporter_id: dofData.reporter_id || 'current-user-id',
        assigned_to: dofData.assigned_to || null,
        status: dofData.status || 'yeni',
        priority: dofData.priority || 'orta',
        due_date: dofData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        facility: mockDOFs[0].facility,
        reporter: mockDOFs[0].reporter
      };

      setDofs(prev => [newDOF, ...prev]);
      return newDOF;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'DÖF oluşturulamadı');
    }
  };

  const updateDOF = async (id: string, updates: Partial<DOF>) => {
    try {
      // Simulate API call
      await new Promise(resolve => window.setTimeout(resolve, 500));
      
      setDofs(prev => prev.map(dof => 
        dof.id === id 
          ? { ...dof, ...updates, updated_at: new Date().toISOString() }
          : dof
      ));
      
      const updatedDOF = dofs.find(dof => dof.id === id);
      return updatedDOF;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'DÖF güncellenemedi');
    }
  };

  const deleteDOF = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => window.setTimeout(resolve, 500));
      setDofs(prev => prev.filter(dof => dof.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'DÖF silinemedi');
    }
  };

  useEffect(() => {
    fetchDOFs();
  }, []);

  return {
    dofs,
    loading,
    error,
    fetchDOFs,
    createDOF,
    updateDOF,
    deleteDOF
  };
};
