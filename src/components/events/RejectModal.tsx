import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onReject: (eventId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  event,
  onReject,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!reason.trim()) {
      newErrors.reason = 'Reddetme gerekçesi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!event || !validateForm()) return;

    try {
      await onReject(event.id, reason);
      setReason('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleClose = () => {
    setReason('');
    setErrors({});
    onClose();
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Olay Bildirimi Reddet"
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
            <p><strong>Bildiren:</strong> {event.reporter_name}</p>
          </div>
        </div>

        {/* Reject Form */}
        <div className="space-y-4">
          <Textarea
            label="Reddetme Gerekçesi *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={errors.reason}
            placeholder="Olay bildiriminin neden reddedildiğini detaylı olarak açıklayın..."
            rows={6}
          />
        </div>

        {/* Warning Box */}
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="bi bi-exclamation-triangle text-danger-600 mt-0.5"></i>
            <div className="text-sm text-danger-800">
              <p className="font-medium mb-1">Uyarı:</p>
              <ul className="space-y-1 text-danger-700">
                <li>• Bu işlem geri alınamaz</li>
                <li>• Olay durumu "Reddedildi" olarak güncellenecektir</li>
                <li>• Bildiren kişiye e-posta ile bilgilendirme yapılacaktır</li>
                <li>• Reddetme gerekçesi sistem kayıtlarında tutulacaktır</li>
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
            className="bg-danger-600 hover:bg-danger-700"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Reddediliyor...
              </>
            ) : (
              <>
                <i className="bi bi-x-circle mr-2"></i>
                Reddet
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
