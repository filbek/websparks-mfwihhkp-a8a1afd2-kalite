import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DOFAttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (files: File[]) => Promise<void>;
    loading?: boolean;
}

export const DOFBulkAttachmentModal: React.FC<DOFAttachmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            addFiles(files);
        }
    };

    const addFiles = (files: File[]) => {
        const validFiles = files.filter(file => {
            // Max 10MB per file
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} çok büyük (max 10MB)`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setError('');
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            setError('Lütfen en az bir dosya seçin');
            return;
        }

        try {
            setError('');
            await onSubmit(selectedFiles);
            setSelectedFiles([]);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Dosyalar yüklenirken bir hata oluştu');
        }
    };

    const handleClose = () => {
        setSelectedFiles([]);
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Toplu Dosya Yükleme"
            size="lg"
        >
            <div className="space-y-4">
                {/* Drag & Drop Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-300 bg-secondary-50'
                        }`}
                >
                    <i className="bi bi-cloud-upload text-4xl text-secondary-400 mb-3 block"></i>
                    <p className="text-sm text-secondary-700 mb-2">
                        Dosyaları buraya sürükleyin veya
                    </p>
                    <label className="cursor-pointer">
                        <span className="text-primary-600 hover:text-primary-700 font-medium">
                            dosya seçin
                        </span>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            disabled={loading}
                        />
                    </label>
                    <p className="text-xs text-secondary-500 mt-2">
                        PDF, Word, Excel, Resim (Max 10MB/dosya)
                    </p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-secondary-900">
                            Seçilen Dosyalar ({selectedFiles.length})
                        </h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200"
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <i className="bi bi-file-earmark text-2xl text-secondary-400"></i>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-secondary-900 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-secondary-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        disabled={loading}
                                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                        disabled={loading || selectedFiles.length === 0}
                    >
                        {loading ? (
                            <>
                                <i className="bi bi-hourglass-split animate-spin mr-2"></i>
                                Yükleniyor...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-upload mr-2"></i>
                                {selectedFiles.length} Dosya Yükle
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
