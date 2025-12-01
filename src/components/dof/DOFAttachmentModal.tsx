import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DOFAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  loading?: boolean;
}

export const DOFAttachmentModal: React.FC<DOFAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    try {
      await onSubmit(file);
      setFile(null);
      setError('');
      onClose();
    } catch (err) {
      setError('Dosya yüklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dosya Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Dosya Seç *
          </label>
          <div className="mt-1">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-secondary-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                cursor-pointer"
              required
            />
          </div>
          <p className="mt-2 text-xs text-secondary-500">
            Maksimum dosya boyutu: 10MB
          </p>
        </div>

        {file && (
          <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="bi bi-file-earmark text-2xl text-secondary-400"></i>
                <div>
                  <p className="text-sm font-medium text-secondary-900">{file.name}</p>
                  <p className="text-xs text-secondary-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-danger-600 hover:text-danger-700"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Yükleniyor...' : 'Dosya Ekle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
