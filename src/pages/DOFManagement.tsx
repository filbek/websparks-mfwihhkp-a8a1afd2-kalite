import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DOFWizard } from '../components/dof/DOFWizard';
import { MyDOFs } from '../components/dof/MyDOFs';
import { FacilityQualityDOFs } from '../components/dof/FacilityQualityDOFs';
import { CentralQualityDOFs } from '../components/dof/CentralQualityDOFs';
import { TaskAssignment } from '../components/dof/TaskAssignment';
import { DOFDetail } from '../components/dof/DOFDetail';
import { useDOFs } from '../hooks/useDOFs';
import { DOF, UserRole, User, TaskAssignmentData } from '../types';

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
  const { dofs, loading, error, createDOF, updateDOF, deleteDOF } = useDOFs();
  const [currentView, setCurrentView] = useState<DOFView>('my-dofs');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDOF, setSelectedDOF] = useState<DOF | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Mock user role - this should come from auth context
  const userRole: UserRole = 'merkez_kalite';
  const facilityName = 'Silivri Şubesi';

  const handleCreateDOF = async (data: Partial<DOF>) => {
    setFormLoading(true);
    try {
      await createDOF(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating DOF:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDOF = (dof: DOF) => {
    setSelectedDOF(dof);
    setIsDetailModalOpen(true);
  };

  const handleEditDOF = (dof: DOF) => {
    // Implementation for editing DOF
    console.log('Edit DOF:', dof);
  };

  const handleCloseDOF = (dof: DOF) => {
    // Implementation for closing DOF
    console.log('Close DOF:', dof);
  };

  const handleAssignDOF = (dof: DOF) => {
    // Implementation for assigning DOF
    console.log('Assign DOF:', dof);
  };

  const handleExportExcel = (facilityId?: number) => {
    // Implementation for Excel export
    console.log('Export Excel:', facilityId);
  };

  const handleTaskAssignment = async (assignment: Partial<TaskAssignmentData>) => {
    // Implementation for task assignment
    console.log('Task Assignment:', assignment);
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
            dofs={dofs.filter(dof => dof.reporter_id === 'current-user-id')}
            loading={loading}
            onView={handleViewDOF}
            onEdit={handleEditDOF}
            onClose={handleCloseDOF}
            onExportExcel={() => handleExportExcel()}
          />
        );

      case 'facility-quality':
        return (
          <FacilityQualityDOFs
            dofs={dofs.filter(dof => dof.facility_id === 1)} // Filter by user's facility
            loading={loading}
            facilityName={facilityName}
            onView={handleViewDOF}
            onAssign={handleAssignDOF}
            onClose={handleCloseDOF}
            onExportExcel={() => handleExportExcel(1)}
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
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">DÖF Yönetimi</h1>
            <p className="text-secondary-600">Düzeltici ve Önleyici Faaliyet Yönetim Sistemi</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {renderViewButtons()}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-success-600 hover:bg-success-700"
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
        <DOFWizard
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
          />
        )}
      </Modal>
    </div>
  );
};
