import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface DOFStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStatus: string, notes: string) => Promise<void>;
  currentStatus: string;
  defaultStatus?: string;
  loading?: boolean;
}

const statusOptions = [
  { value: 'taslak', label: 'Taslak' },
  { value: 'atanmayı_bekleyen', label: 'Atanmayı Bekleyen' },
  { value: 'atanan', label: 'Atanan' },
  { value: 'çözüm_bekleyen', label: 'Çözüm Bekliyor' },
  { value: 'kapatma_onayında', label: 'Kapatma Onayında' },
  { value: 'kapatıldı', label: 'Kapatıldı' },
  { value: 'iptal', label: 'İptal' },
  { value: 'reddedildi', label: 'Reddedildi' }
];

export const DOFStatusModal: React.FC<DOFStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  defaultStatus,
  loading = false
}) => {
  const [newStatus, setNewStatus] = useState(defaultStatus || currentStatus);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewStatus(defaultStatus || currentStatus);
      setNotes('');
      setError('');
    }
  }, [isOpen, currentStatus, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus) {
      setError('Lütfen bir durum seçin');
      return;
    }

    if (newStatus === currentStatus) {
      setError('Yeni durum mevcut durumla aynı');
      return;
    }

    try {
      await onSubmit(newStatus, notes);
      setNotes('');
      setNewStatus(currentStatus);
      setError('');
      onClose();
    } catch (err) {
      setError('Durum değiştirilirken bir hata oluştu');
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Durum Değiştir">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Mevcut Durum
          </label>
          <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">
            <p className="text-sm font-medium text-secondary-900">
              {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Yeni Durum *
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white text-secondary-700"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Notlar
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Durum değişikliği ile ilgili notlar ekleyebilirsiniz..."
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Değiştiriliyor...' : 'Durumu Değiştir'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
