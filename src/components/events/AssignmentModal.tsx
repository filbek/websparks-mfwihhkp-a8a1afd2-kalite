import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';
import { useUsers } from '../../hooks/useUsers';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onAssign: (eventId: string, assigneeId: string, notes: string) => Promise<void>;
  loading?: boolean;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  event,
  onAssign,
  loading = false
}) => {
  const [selectedManager, setSelectedManager] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { users } = useUsers();

  const activeUsers = users.filter(u => u.is_active);

  const managerOptions = [
    { value: '', label: 'Müdür/Birim Seçiniz' },
    ...activeUsers.map(user => ({
      value: user.id,
      label: `${user.display_name} - ${user.department_name || user.role.join(', ')}`
    }))
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedManager) {
      newErrors.manager = 'Müdür/Birim seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!event || !validateForm()) return;

    try {
      await onAssign(event.id, selectedManager, notes);
      setSelectedManager('');
      setNotes('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Assignment error:', error);
    }
  };

  const handleClose = () => {
    setSelectedManager('');
    setNotes('');
    setErrors({});
    onClose();
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Müdüre Ata ve Bildir"
      size="md"
    >
      <div className="space-y-6">
        {/* Event Info */}
        <div className="bg-secondary-50 rounded-lg p-4">
          <h4 className="font-medium text-secondary-900 mb-2">Olay Bilgileri</h4>
          <div className="space-y-1 text-sm text-secondary-600">
            <p><strong>Kod:</strong> {event.event_code || `${event.event_type.toUpperCase()}-${new Date(event.created_at).getFullYear()}-${event.id.padStart(3, '0')}`}</p>
            <p><strong>Sınıf:</strong> {event.event_class}</p>
            <p><strong>Tarih:</strong> {new Date(event.event_date).toLocaleDateString('tr-TR')} {event.event_time}</p>
            <p><strong>Yer:</strong> {event.location}</p>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="space-y-4">
          <Select
            label="Atanacak Müdür/Birim *"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            options={managerOptions}
            error={errors.manager}
          />

          <Textarea
            label="Atama Notları (İsteğe Bağlı)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Atama ile ilgili özel notlarınızı yazabilirsiniz..."
            rows={4}
          />
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="bi bi-info-circle text-primary-600 mt-0.5"></i>
            <div className="text-sm text-primary-800">
              <p className="font-medium mb-1">Bilgilendirme:</p>
              <ul className="space-y-1 text-primary-700">
                <li>• Seçilen müdüre e-posta bildirimi gönderilecektir</li>
                <li>• Olay durumu "Atanan" olarak güncellenecektir</li>
                <li>• Atama kaydı sistem loglarında tutulacaktır</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Atanıyor...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus mr-2"></i>
                Ata ve Bildir
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
