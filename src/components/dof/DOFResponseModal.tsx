import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DOFResponseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => Promise<void>;
    loading?: boolean;
}

export const DOFResponseModal: React.FC<DOFResponseModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false
}) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setError('Lütfen yanıt/açıklama girin');
            return;
        }

        try {
            setError('');
            await onSubmit(comment);
            setComment('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Yanıt gönderilirken bir hata oluştu');
        }
    };

    const handleClose = () => {
        setComment('');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="DÖF Yanıtı Gönder"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <i className="bi bi-info-circle text-warning-600 text-xl mr-3 mt-0.5"></i>
                        <div>
                            <h4 className="font-semibold text-warning-900 mb-1">Önemli Bilgi</h4>
                            <p className="text-sm text-warning-700">
                                Yanıtınızı gönderdikten sonra DÖF otomatik olarak "Kapatma Onayında" durumuna geçecek ve
                                atayan kişi ile kalite yöneticilerine bildirim gönderilecektir.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Yanıt / Açıklama <span className="text-danger-600">*</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Yaptığınız işlemleri, çözüm önerilerinizi ve açıklamalarınızı buraya yazın..."
                        rows={8}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={loading}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                        Detaylı açıklama yapmanız, onay sürecini hızlandıracaktır.
                    </p>
                </div>

                {error && (
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                        <p className="text-sm text-danger-700">{error}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !comment.trim()}
                    >
                        {loading ? (
                            <>
                                <i className="bi bi-hourglass-split animate-spin mr-2"></i>
                                Gönderiliyor...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send mr-2"></i>
                                Yanıt Gönder
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
