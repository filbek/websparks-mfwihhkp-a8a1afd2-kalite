import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface DOFCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, isInternal: boolean) => Promise<void>;
  loading?: boolean;
}

export const DOFCommentModal: React.FC<DOFCommentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Lütfen bir yorum girin');
      return;
    }

    try {
      await onSubmit(comment, isInternal);
      setComment('');
      setIsInternal(false);
      setError('');
      onClose();
    } catch (err) {
      setError('Yorum eklenirken bir hata oluştu');
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yorum Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Yorum *
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu buraya yazın..."
            rows={6}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isInternal"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label htmlFor="isInternal" className="ml-2 text-sm text-secondary-700">
            İç not olarak işaretle (sadece yetkililer görebilir)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Yorum Ekle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
