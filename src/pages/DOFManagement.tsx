import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DOFFormDynamic } from '../components/dof/DOFFormDynamic';
import { MyDOFs } from '../components/dof/MyDOFs';
import { FacilityQualityDOFs } from '../components/dof/FacilityQualityDOFs';
import { CentralQualityDOFs } from '../components/dof/CentralQualityDOFs';
import { TaskAssignment } from '../components/dof/TaskAssignment';
import { DOFDetail } from '../components/dof/DOFDetail';
import { DOFAssignModal } from '../components/dof/DOFAssignModal';
import { DOFCommentModal } from '../components/dof/DOFCommentModal';
import { DOFAttachmentModal } from '../components/dof/DOFAttachmentModal';
import { DOFStatusModal } from '../components/dof/DOFStatusModal';
import { useDOFs } from '../hooks/useDOFs';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { DOF, UserRole, User, TaskAssignmentData } from '../types';
import { format } from 'date-fns';

type DOFView = 'create' | 'my-dofs' | 'facility-quality' | 'central-quality' | 'task-assignment';

// Mock users data
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'mehmet@hospital.com',
    display_name: 'Dr. Mehmet Yılmaz',
    role: ['personel'],
    facility_id: 1,
    department_id: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'ayse@hospital.com',
    display_name: 'Ayşe Kaya',
    role: ['sube_kalite'],
    facility_id: 1,
    department_id: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'fatma@hospital.com',
    display_name: 'Fatma Demir',
    role: ['personel'],
    facility_id: 2,
    department_id: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const DOFManagement: React.FC = () => {
  const { user } = useAuth();
  const { dofs, loading, error, createDOF, updateDOF, deleteDOF, assignDOF, addComment, addAttachment, changeStatus, fetchDOFs } = useDOFs();
  const { users: dbUsers } = useUsers();
  const [currentView, setCurrentView] = useState<DOFView>('my-dofs');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDOF, setSelectedDOF] = useState<DOF | null>(null);
  const [targetStatus, setTargetStatus] = useState<string | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const userRole: UserRole = user?.role?.[0] || 'personel';
  const facilityName = user?.department_name || 'Şube';
  const userId = user?.id;

  const handleCreateDOF = async (data: Partial<DOF>) => {
    setFormLoading(true);
    try {
      await createDOF(data);
      alert('DÖF başarıyla oluşturuldu!');
      setIsCreateModalOpen(false);
      fetchDOFs();
    } catch (error) {
      console.error('Error creating DOF:', error);
      const errorMessage = error instanceof Error ? error.message : 'DÖF oluşturulurken bir hata oluştu';
      alert(`Hata: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDOF = (dof: DOF) => {
    setSelectedDOF(dof);
    setIsDetailModalOpen(true);
  };

  const handleEditDOF = (dof: DOF) => {
    setSelectedDOF(dof);
    setIsDetailModalOpen(true);
  };

  const handleCloseDOF = (dof: DOF) => {
    setSelectedDOF(dof);
    setTargetStatus('kapatıldı');
    setIsStatusModalOpen(true);
  };

  const handleAssignDOF = (dof: DOF) => {
    setSelectedDOF(dof);
    setIsAssignModalOpen(true);
  };

  const handleExportExcel = (facilityId?: number) => {
    try {
      let filteredDofs = dofs;

      if (facilityId) {
        filteredDofs = dofs.filter(dof => dof.facility_id === facilityId);
      }

      if (filteredDofs.length === 0) {
        alert('Dışa aktarılacak DÖF bulunamadı');
        return;
      }

      const exportData = filteredDofs.map(dof => ({
        'DÖF No': dof.id,
        'Başlık': dof.title,
        'Açıklama': dof.description,
        'Şube': dof.facility?.name || '',
        'Rapor Eden': dof.reporter?.display_name || '',
        'Atanan Kişi': dof.assignee?.display_name || '',
        'Durum': getStatusLabel(dof.status),
        'Öncelik': getPriorityLabel(dof.priority),
        'Son Tarih': dof.due_date ? format(new Date(dof.due_date), 'dd.MM.yyyy') : '',
        'Oluşturma Tarihi': format(new Date(dof.created_at), 'dd.MM.yyyy HH:mm'),
        'Güncelleme Tarihi': format(new Date(dof.updated_at), 'dd.MM.yyyy HH:mm')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DÖF Listesi');

      const fileName = `DOF_Listesi_${format(new Date(), 'dd-MM-yyyy_HHmm')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert('Excel dosyası başarıyla indirildi');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'open': 'Açık',
      'in_progress': 'İşlemde',
      'resolved': 'Çözüldü',
      'closed': 'Kapatıldı'
    };
    return statusLabels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityLabels: Record<string, string> = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'critical': 'Kritik'
    };
    return priorityLabels[priority] || priority;
  };

  const handleTaskAssignment = async (assignment: Partial<TaskAssignmentData>) => {
    console.log('Task Assignment:', assignment);
  };

  const handleAssignUser = async (userId: string, notes: string) => {
    if (!selectedDOF) return;

    setFormLoading(true);
    try {
      await assignDOF(selectedDOF.id, userId, notes);
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error('Error assigning DOF:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddComment = async (comment: string, isInternal: boolean) => {
    if (!selectedDOF) return;

    setFormLoading(true);
    try {
      await addComment(selectedDOF.id, comment, isInternal);
      setIsCommentModalOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddAttachment = async (file: File) => {
    if (!selectedDOF) return;

    setFormLoading(true);
    try {
      await addAttachment(selectedDOF.id, file);
      setIsAttachmentModalOpen(false);
      alert('Dosya başarıyla eklendi');
    } catch (error) {
      console.error('Error adding attachment:', error);
      alert(error instanceof Error ? error.message : 'Dosya eklenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: string, notes: string) => {
    if (!selectedDOF) return;

    setFormLoading(true);
    try {
      await changeStatus(selectedDOF.id, newStatus, notes);
      setIsStatusModalOpen(false);
      alert('Durum başarıyla güncellendi: ' + newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Durum değiştirilirken bir hata oluştu';
      alert('Hata: ' + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'create': return 'Yeni DÖF Oluştur';
      case 'my-dofs': return 'Takibimdeki DÖF\'ler';
      case 'facility-quality': return 'Şube Kalite İşlemleri';
      case 'central-quality': return 'Merkez Kalite İzleme';
      case 'task-assignment': return 'Görev Atama';
      default: return 'DÖF Yönetimi';
    }
  };

  const renderViewButtons = () => {
    const buttons = [
      { id: 'my-dofs' as DOFView, label: 'Takibimdeki DÖF\'ler', icon: 'bi-person-lines-fill', roles: ['personel', 'sube_kalite', 'merkez_kalite'] },
      { id: 'facility-quality' as DOFView, label: 'Şube Kalite', icon: 'bi-building-check', roles: ['sube_kalite'] },
      { id: 'central-quality' as DOFView, label: 'Merkez Kalite', icon: 'bi-globe', roles: ['merkez_kalite'] },
      { id: 'task-assignment' as DOFView, label: 'Görev Atama', icon: 'bi-arrow-left-right', roles: ['sube_kalite', 'merkez_kalite'] }
    ];

    return buttons
      .filter(button => button.roles.includes(userRole))
      .map(button => (
        <Button
          key={button.id}
          variant={currentView === button.id ? 'primary' : 'outline'}
          onClick={() => setCurrentView(button.id)}
          className="flex items-center"
        >
          <i className={`bi ${button.icon} mr-2`}></i>
          {button.label}
        </Button>
      ));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'my-dofs':
        return (
          <MyDOFs
            dofs={dofs.filter(dof => dof.reporter_id === userId || dof.assigned_to === userId)}
            loading={loading}
            onView={handleViewDOF}
            onClose={handleCloseDOF}
            onExportExcel={() => handleExportExcel()}
          />
        );

      case 'facility-quality':
        return (
          <FacilityQualityDOFs
            dofs={dofs.filter(dof => dof.facility_id === user?.facility_id)}
            loading={loading}
            facilityName={facilityName}
            onView={handleViewDOF}
            onAssign={handleAssignDOF}
            onClose={handleCloseDOF}
            onExportExcel={() => handleExportExcel(user?.facility_id)}
          />
        );

      case 'central-quality':
        return (
          <CentralQualityDOFs
            dofs={dofs}
            loading={loading}
            onView={handleViewDOF}
            onAssign={handleAssignDOF}
            onClose={handleCloseDOF}
            onExportExcel={handleExportExcel}
          />
        );

      case 'task-assignment':
        return (
          <TaskAssignment
            users={mockUsers}
            dofs={dofs}
            onAssign={handleTaskAssignment}
            loading={formLoading}
          />
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-4xl text-danger-600"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Hata Oluştu</h3>
        <p className="text-secondary-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Sayfayı Yenile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">DÖF Yönetimi</h1>
            <p className="text-secondary-600 dark:text-secondary-400">Düzeltici ve Önleyici Faaliyet Yönetim Sistemi</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {renderViewButtons()}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-success-600 hover:bg-success-700 text-white"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Yeni DÖF
            </Button>
          </div>
        </div>
      </div>

      {/* Current View */}
      {renderCurrentView()}

      {/* Create DOF Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title=""
        size="xl"
      >
        <DOFFormDynamic
          onSubmit={handleCreateDOF}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* DOF Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDOF(null);
        }}
        title=""
        size="xl"
      >
        {selectedDOF && (
          <DOFDetail
            dof={selectedDOF}
            onEdit={() => handleEditDOF(selectedDOF)}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedDOF(null);
            }}
            onAssign={() => setIsAssignModalOpen(true)}
            onAddComment={() => setIsCommentModalOpen(true)}
            onAddAttachment={() => setIsAttachmentModalOpen(true)}
            onChangeStatus={() => setIsStatusModalOpen(true)}
          />
        )}
      </Modal>

      {/* Assign Modal */}
      <DOFAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignUser}
        users={dbUsers || []}
        currentAssigneeId={selectedDOF?.assigned_to}
        loading={formLoading}
      />

      {/* Comment Modal */}
      <DOFCommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleAddComment}
        loading={formLoading}
      />

      {/* Attachment Modal */}
      <DOFAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSubmit={handleAddAttachment}
        loading={formLoading}
      />

      {/* Status Change Modal */}
      {selectedDOF && (
        <DOFStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setTargetStatus(undefined);
          }}
          onSubmit={handleChangeStatus}
          currentStatus={selectedDOF.status}
          defaultStatus={targetStatus}
          loading={formLoading}
        />
      )}
    </div>
  );
};
