import React, { useState, useEffect } from 'react';
import { Paperclip, Download, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import * as attachmentApi from '../../lib/attachmentApi';

interface AttachmentsSectionProps {
    cardId: string;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ cardId }) => {
    const [attachments, setAttachments] = useState<attachmentApi.Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadAttachments();
    }, [cardId]);

    const loadAttachments = async () => {
        try {
            setLoading(true);
            const data = await attachmentApi.fetchAttachments(cardId);
            setAttachments(data);
        } catch (error) {
            console.error('Error loading attachments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const attachment = await attachmentApi.uploadFile(file, cardId);
                setAttachments([attachment, ...attachments]);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Dosya yüklenirken bir hata oluştu');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;

        try {
            await attachmentApi.deleteAttachment(id, fileUrl);
            setAttachments(attachments.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting attachment:', error);
            alert('Dosya silinirken bir hata oluştu');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Ekler
                </h3>
                <label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Button size="sm" variant="outline" disabled={uploading} as="span">
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading ? 'Yükleniyor...' : 'Dosya Ekle'}
                    </Button>
                </label>
            </div>

            {attachments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                    Henüz ek dosya yok
                </p>
            ) : (
                <div className="space-y-2">
                    {attachments.map(attachment => (
                        <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {attachment.file_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-primary-600 rounded"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => handleDelete(attachment.id, attachment.file_url)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
