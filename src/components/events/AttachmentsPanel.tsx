import React from 'react';
import { Button } from '../ui/Button';
import { Event } from '../../types/events';

interface AttachmentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

// Mock attachments data
const mockAttachments = [
  {
    id: '1',
    name: 'olay_fotografı_1.jpg',
    type: 'image/jpeg',
    size: 2.5,
    uploadedAt: '2024-01-15T10:30:00Z',
    url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
  },
  {
    id: '2',
    name: 'tutanak_formu.pdf',
    type: 'application/pdf',
    size: 1.2,
    uploadedAt: '2024-01-15T11:15:00Z',
    url: '#'
  },
  {
    id: '3',
    name: 'witness_statement.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 0.8,
    uploadedAt: '2024-01-15T14:20:00Z',
    url: '#'
  }
];

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  isOpen,
  onClose,
  event
}) => {
  if (!isOpen || !event) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'bi-file-earmark-image';
    if (type === 'application/pdf') return 'bi-file-earmark-pdf';
    if (type.includes('word')) return 'bi-file-earmark-word';
    if (type.includes('excel')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  };

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleDownload = (attachment: any) => {
    // In a real app, this would generate a signed URL and download the file
    console.log('Downloading:', attachment.name);
  };

  const handlePreview = (attachment: any) => {
    if (attachment.type.startsWith('image/')) {
      window.open(attachment.url, '_blank');
    } else {
      console.log('Previewing:', attachment.name);
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
          {mockAttachments.length === 0 ? (
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
                Dosyalar ({mockAttachments.length})
              </h4>
              
              {mockAttachments.map((attachment) => (
                <div key={attachment.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className={`bi ${getFileIcon(attachment.type)} text-primary-600`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-secondary-900 truncate">
                        {attachment.name}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-secondary-500">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        {attachment.type.startsWith('image/') && (
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
                  {attachment.type.startsWith('image/') && (
                    <div className="mt-3">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => handlePreview(attachment)}
                        crossOrigin="anonymous"
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
