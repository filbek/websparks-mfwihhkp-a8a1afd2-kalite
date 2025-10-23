import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { DOF, User, TaskAssignmentData } from '../../types';

interface TaskAssignmentProps {
  users: User[];
  dofs: DOF[];
  onAssign: (assignment: Partial<TaskAssignmentData>) => Promise<void>;
  loading?: boolean;
}

export const TaskAssignment: React.FC<TaskAssignmentProps> = ({
  users,
  dofs,
  onAssign,
  loading = false
}) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [fromUser, setFromUser] = useState('');
  const [toUser, setToUser] = useState('');
  const [selectedDOFs, setSelectedDOFs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const facilityOptions = [
    { value: '', label: 'Şube Seçiniz' },
    { value: '1', label: 'Silivri Şubesi' },
    { value: '2', label: 'Avcılar Şubesi' },
    { value: '3', label: 'Ereğli Şubesi' }
  ];

  const filteredUsers = users.filter(user => 
    !selectedFacility || user.facility_id.toString() === selectedFacility
  );

  const fromUserOptions = [
    { value: '', label: 'Görev Devreden Kişi Seçiniz' },
    ...filteredUsers.map(user => ({
      value: user.id,
      label: `${user.display_name} (${user.email})`
    }))
  ];

  const toUserOptions = [
    { value: '', label: 'Görev Alacak Kişi Seçiniz' },
    ...filteredUsers.filter(user => user.id !== fromUser).map(user => ({
      value: user.id,
      label: `${user.display_name} (${user.email})`
    }))
  ];

  const userDOFs = dofs.filter(dof => 
    dof.assigned_to === fromUser || dof.reporter_id === fromUser
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedFacility) newErrors.facility = 'Şube seçiniz';
    if (!fromUser) newErrors.fromUser = 'Görev devreden kişi seçiniz';
    if (!toUser) newErrors.toUser = 'Görev alacak kişi seçiniz';
    if (selectedDOFs.length === 0) newErrors.dofs = 'En az bir DÖF seçiniz';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onAssign({
        from_user_id: fromUser,
        to_user_id: toUser,
        facility_id: parseInt(selectedFacility),
        dof_ids: selectedDOFs,
        notes,
        status: 'pending'
      });

      // Reset form
      setSelectedFacility('');
      setFromUser('');
      setToUser('');
      setSelectedDOFs([]);
      setNotes('');
    } catch (error) {
      console.error('Task assignment error:', error);
    }
  };

  const handleDOFSelection = (dofId: string, checked: boolean) => {
    if (checked) {
      setSelectedDOFs(prev => [...prev, dofId]);
    } else {
      setSelectedDOFs(prev => prev.filter(id => id !== dofId));
    }
  };

  const selectAllDOFs = () => {
    setSelectedDOFs(userDOFs.map(dof => dof.id));
  };

  const deselectAllDOFs = () => {
    setSelectedDOFs([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Görev Atama</h1>
            <p className="text-secondary-100">İşten ayrılan personelin görevlerini yeni personele devredin</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-arrow-left-right text-2xl"></i>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Facility Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-primary-600">1</span>
              </div>
              Şube Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="Şube"
              value={selectedFacility}
              onChange={(e) => {
                setSelectedFacility(e.target.value);
                setFromUser('');
                setToUser('');
                setSelectedDOFs([]);
              }}
              options={facilityOptions}
              error={errors.facility}
            />
          </CardContent>
        </Card>

        {/* Step 2: User Selection */}
        {selectedFacility && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-primary-600">2</span>
                </div>
                Personel Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Görev Devreden Kişi"
                  value={fromUser}
                  onChange={(e) => {
                    setFromUser(e.target.value);
                    setToUser('');
                    setSelectedDOFs([]);
                  }}
                  options={fromUserOptions}
                  error={errors.fromUser}
                />

                <Select
                  label="Görev Alacak Kişi"
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  options={toUserOptions}
                  error={errors.toUser}
                  disabled={!fromUser}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: DOF Selection */}
        {fromUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-primary-600">3</span>
                  </div>
                  DÖF Seçimi
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={selectAllDOFs}
                    disabled={userDOFs.length === 0}
                  >
                    Tümünü Seç
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={deselectAllDOFs}
                    disabled={selectedDOFs.length === 0}
                  >
                    Seçimi Temizle
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userDOFs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-clipboard-x text-2xl text-secondary-400"></i>
                  </div>
                  <p className="text-secondary-600">Seçilen kullanıcının aktif DÖF'ü bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userDOFs.map((dof) => (
                    <div key={dof.id} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50">
                      <input
                        type="checkbox"
                        id={`dof-${dof.id}`}
                        checked={selectedDOFs.includes(dof.id)}
                        onChange={(e) => handleDOFSelection(dof.id, e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`dof-${dof.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-secondary-900 mb-1">{dof.title}</h4>
                            <p className="text-sm text-secondary-600 mb-2 line-clamp-2">{dof.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-secondary-500">
                              <span className="flex items-center">
                                <i className="bi bi-calendar mr-1"></i>
                                {new Date(dof.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="flex items-center">
                                <i className="bi bi-person mr-1"></i>
                                {dof.assigned_to === fromUser ? 'Atanan' : 'Rapor Eden'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              dof.priority === 'kritik' ? 'bg-danger-100 text-danger-700' :
                              dof.priority === 'yüksek' ? 'bg-warning-100 text-warning-700' :
                              dof.priority === 'orta' ? 'bg-primary-100 text-primary-700' :
                              'bg-secondary-100 text-secondary-700'
                            }`}>
                              {dof.priority.charAt(0).toUpperCase() + dof.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              dof.status === 'kapatildi' ? 'bg-success-100 text-success-700' :
                              dof.status === 'atanan' ? 'bg-primary-100 text-primary-700' :
                              'bg-warning-100 text-warning-700'
                            }`}>
                              {dof.status.replace('_', ' ').charAt(0).toUpperCase() + dof.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {errors.dofs && (
                <p className="text-sm text-danger-600 mt-2">{errors.dofs}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Notes and Submit */}
        {selectedDOFs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-primary-600">4</span>
                </div>
                Notlar ve Onay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Textarea
                  label="Devir Notları (Opsiyonel)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Görev devri ile ilgili özel notlarınızı yazabilirsiniz..."
                  rows={4}
                />

                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-medium text-primary-900 mb-2">Devir Özeti</h4>
                  <div className="space-y-2 text-sm text-primary-800">
                    <p><strong>Şube:</strong> {facilityOptions.find(f => f.value === selectedFacility)?.label}</p>
                    <p><strong>Görev Devreden:</strong> {filteredUsers.find(u => u.id === fromUser)?.display_name}</p>
                    <p><strong>Görev Alan:</strong> {filteredUsers.find(u => u.id === toUser)?.display_name}</p>
                    <p><strong>Devredilecek DÖF Sayısı:</strong> {selectedDOFs.length}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFacility('');
                      setFromUser('');
                      setToUser('');
                      setSelectedDOFs([]);
                      setNotes('');
                      setErrors({});
                    }}
                  >
                    Formu Temizle
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-success-600 hover:bg-success-700"
                  >
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                        Devrediliyor...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-left-right mr-2"></i>
                        Görevleri Devret
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};
