import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Event } from '../../types/events';
import { useEventAttachments, EventAttachment } from '../../hooks/useEventAttachments';
import { supabase } from '../../lib/supabase';

interface AttachmentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { getEventAttachments, downloadFile, loading } = useEventAttachments();
  const [attachments, setAttachments] = useState<EventAttachment[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && event) {
      loadAttachments();
    }
  }, [isOpen, event]);

  const loadAttachments = async () => {
    if (!event?.id) return;

    const data = await getEventAttachments(event.id);
    setAttachments(data);

    // Generate signed URLs for images
    const urls: Record<string, string> = {};
    for (const attachment of data) {
      if (attachment.file_type.startsWith('image/')) {
        try {
          const { data: urlData } = await supabase.storage
            .from('event-attachments')
            .createSignedUrl(attachment.file_path, 3600);

          if (urlData?.signedUrl) {
            urls[attachment.id] = urlData.signedUrl;
          }
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      }
    }
    setPreviewUrls(urls);
  };

  if (!isOpen || !event) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'bi-file-earmark-image';
    if (type === 'application/pdf') return 'bi-file-earmark-pdf';
    if (type.includes('word')) return 'bi-file-earmark-word';
    if (type.includes('excel')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  };

  const formatFileSize = (sizeInBytes: number) => {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB < 1) {
      const sizeInKB = sizeInBytes / 1024;
      return `${sizeInKB.toFixed(1)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleDownload = async (attachment: EventAttachment) => {
    try {
      await downloadFile(attachment.file_path, attachment.file_name);
    } catch (error) {
      console.error('Download error:', error);
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handlePreview = async (attachment: EventAttachment) => {
    if (attachment.file_type.startsWith('image/')) {
      const url = previewUrls[attachment.id];
      if (url) {
        window.open(url, '_blank');
      }
    } else if (attachment.file_type === 'application/pdf') {
      try {
        const { data } = await supabase.storage
          .from('event-attachments')
          .createSignedUrl(attachment.file_path, 3600);

        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
        }
      } catch (error) {
        console.error('Preview error:', error);
        alert('Dosya önizlenemedi. Lütfen indirmeyi deneyin.');
      }
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Olay Ekleri</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>

        {/* Event Info */}
        <div className="p-6 border-b border-secondary-200 bg-secondary-50">
          <div className="space-y-2 text-sm">
            <p><strong>Kod:</strong> {event.event_code || `${event.event_type.toUpperCase()}-${new Date(event.created_at).getFullYear()}-${event.id.padStart(3, '0')}`}</p>
            <p><strong>Tarih:</strong> {new Date(event.event_date).toLocaleDateString('tr-TR')}</p>
            <p><strong>Sınıf:</strong> {event.event_class}</p>
          </div>
        </div>

        {/* Attachments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4">
                <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600"></i>
              </div>
              <p className="text-secondary-600">Ekler yükleniyor...</p>
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-paperclip text-2xl text-secondary-400"></i>
              </div>
              <h4 className="text-lg font-medium text-secondary-900 mb-2">Ek bulunamadı</h4>
              <p className="text-secondary-600">Bu olay için henüz ek dosya yüklenmemiş.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-secondary-900 mb-4">
                Dosyalar ({attachments.length})
              </h4>

              {attachments.map((attachment) => (
                <div key={attachment.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className={`bi ${getFileIcon(attachment.file_type)} text-primary-600`}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-secondary-900 truncate">
                        {attachment.file_name}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-secondary-500">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.uploaded_at).toLocaleDateString('tr-TR')}</span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        {(attachment.file_type.startsWith('image/') || attachment.file_type === 'application/pdf') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(attachment)}
                          >
                            <i className="bi bi-eye mr-1"></i>
                            Önizle
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(attachment)}
                        >
                          <i className="bi bi-download mr-1"></i>
                          İndir
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {attachment.file_type.startsWith('image/') && previewUrls[attachment.id] && (
                    <div className="mt-3">
                      <img
                        src={previewUrls[attachment.id]}
                        alt={attachment.file_name}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handlePreview(attachment)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-secondary-200 bg-secondary-50">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            <i className="bi bi-x-circle mr-2"></i>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
};
