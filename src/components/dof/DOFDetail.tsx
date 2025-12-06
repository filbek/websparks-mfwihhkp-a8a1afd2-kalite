import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DOF } from '../../types';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from '../../lib/utils';
import { useDOFComments } from '../../hooks/useDOFComments';
import { useDOFAttachments } from '../../hooks/useDOFAttachments';
import { useDOFs } from '../../hooks/useDOFs';
import { FilePreviewModal } from '../ui/FilePreviewModal';
import { useAuth } from '../../contexts/AuthContext';

interface DOFDetailProps {
  dof: DOF;
  onEdit: () => void;
  onClose: () => void;
  onAssign: () => void;
  onAddComment: () => void;
  onAddAttachment: () => void;
  onChangeStatus: () => void;
}

export const DOFDetail: React.FC<DOFDetailProps> = ({
  dof,
  onEdit,
  onClose,
  onAssign,
  onAddComment,
  onAddAttachment,
  onChangeStatus
}) => {
  const { canEditDOF } = useAuth();
  const { comments, loading: commentsLoading } = useDOFComments(dof.id);
  const { attachments, loading: attachmentsLoading, refetch: refetchAttachments } = useDOFAttachments(dof.id);
  const { deleteAttachment, getAttachmentUrl } = useDOFs();

  const [previewFile, setPreviewFile] = useState<{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string | null;
    uploadedBy?: string;
    uploadedAt?: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;

    try {
      setDeletingId(attachmentId);
      await deleteAttachment(attachmentId);
      await refetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Dosya silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreviewAttachment = async (attachment: any) => {
    try {
      setLoadingUrl(attachment.id);
      const url = await getAttachmentUrl(attachment.storage_path);
      setPreviewFile({
        fileName: attachment.file_name,
        fileType: attachment.file_type,
        fileSize: attachment.file_size,
        fileUrl: url,
        uploadedBy: attachment.user?.display_name,
        uploadedAt: attachment.created_at
      });
    } catch (error) {
      console.error('Error getting file URL:', error);
      alert('Dosya önizlenirken bir hata oluştu');
    } finally {
      setLoadingUrl(null);
    }
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      const url = await getAttachmentUrl(attachment.storage_path);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Dosya indirilemedi');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Dosya indirilirken bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">{dof.title}</h1>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(dof.priority)}`}>
              <i className="bi bi-flag mr-1"></i>
              {dof.priority.charAt(0).toUpperCase() + dof.priority.slice(1)} Öncelik
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dof.status)}`}>
              <i className="bi bi-circle-fill mr-1 text-xs"></i>
              {getStatusLabel(dof.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canEditDOF(dof) ? (
            <Button variant="outline" onClick={onEdit}>
              <i className="bi bi-pencil mr-2"></i>
              Düzenle
            </Button>
          ) : (
            dof.status === 'kapatıldı' || dof.status === 'iptal' ? (
              <span className="text-xs text-secondary-500 px-3 py-2">
                Kapatılmış/İptal edilmiş DÖF düzenlenemez
              </span>
            ) : null
          )}
          <Button variant="ghost" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
                {dof.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary-600">Şube</label>
                <p className="text-secondary-900 font-medium">
                  {dof.facility?.name || 'Bilinmeyen Şube'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-600">Rapor Eden</label>
                <p className="text-secondary-900 font-medium">
                  {dof.reporter?.display_name || 'Bilinmeyen'}
                </p>
              </div>

              {dof.assignee && (
                <div>
                  <label className="text-sm font-medium text-secondary-600">Atanan Kişi</label>
                  <p className="text-secondary-900 font-medium">
                    {dof.assignee.display_name}
                  </p>
                </div>
              )}

              {dof.tespit_tarihi && (
                <div>
                  <label className="text-sm font-medium text-secondary-600">Tespit Tarihi</label>
                  <p className="text-secondary-900 font-medium">
                    {formatDate(dof.tespit_tarihi)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-secondary-600">Oluşturulma Tarihi</label>
                <p className="text-secondary-900 font-medium">
                  {formatDate(dof.created_at)}
                </p>
              </div>

              {dof.due_date && (
                <div>
                  <label className="text-sm font-medium text-secondary-600">Bitiş Tarihi</label>
                  <p className="text-secondary-900 font-medium">
                    {formatDate(dof.due_date)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-secondary-600">Son Güncelleme</label>
                <p className="text-secondary-900 font-medium">
                  {formatDate(dof.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" onClick={onAssign}>
                <i className="bi bi-person-plus mr-2"></i>
                Atama Yap
              </Button>
              <Button className="w-full" variant="outline" onClick={onAddComment}>
                <i className="bi bi-chat-dots mr-2"></i>
                Yorum Ekle
              </Button>
              <Button className="w-full" variant="outline" onClick={onAddAttachment}>
                <i className="bi bi-paperclip mr-2"></i>
                Dosya Ekle
              </Button>
              <Button className="w-full" variant="outline" onClick={onChangeStatus}>
                <i className="bi bi-arrow-repeat mr-2"></i>
                Durum Değiştir
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Yorumlar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yorumlar</CardTitle>
            <Button variant="outline" size="sm" onClick={onAddComment}>
              <i className="bi bi-plus-lg mr-2"></i>
              Yorum Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="text-center py-4 text-secondary-500">Yorumlar yükleniyor...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <i className="bi bi-chat-dots text-4xl mb-2"></i>
              <p>Henüz yorum yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-secondary-900">
                      {comment.user?.display_name || 'Bilinmeyen'}
                      {comment.is_internal && (
                        <span className="ml-2 text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded">
                          İç Not
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-secondary-500">{formatDate(comment.created_at)}</p>
                  </div>
                  <p className="text-sm text-secondary-700 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dosya Ekleri */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dosya Ekleri</CardTitle>
            <Button variant="outline" size="sm" onClick={onAddAttachment}>
              <i className="bi bi-paperclip mr-2"></i>
              Dosya Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attachmentsLoading ? (
            <div className="text-center py-4 text-secondary-500">Dosyalar yükleniyor...</div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <i className="bi bi-file-earmark text-4xl mb-2"></i>
              <p>Henüz dosya yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map(attachment => (
                <div key={attachment.id} className="group flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg border border-secondary-200 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <i className="bi bi-file-earmark text-2xl text-secondary-400"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{attachment.file_name}</p>
                      <p className="text-xs text-secondary-500">
                        {formatFileSize(attachment.file_size)} • {attachment.user?.display_name || 'Bilinmeyen'} • {formatDate(attachment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewAttachment(attachment)}
                      disabled={loadingUrl === attachment.id}
                    >
                      {loadingUrl === attachment.id ? (
                        <i className="bi bi-hourglass-split animate-spin"></i>
                      ) : (
                        <i className="bi bi-eye"></i>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <i className="bi bi-download"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      disabled={deletingId === attachment.id}
                      className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                    >
                      {deletingId === attachment.id ? (
                        <i className="bi bi-hourglass-split animate-spin"></i>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aktivite Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivite Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <i className="bi bi-plus text-primary-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary-900">
                  <span className="font-medium">{dof.reporter?.display_name}</span> DÖF kaydını oluşturdu
                </p>
                <p className="text-xs text-secondary-600">{formatDate(dof.created_at)}</p>
              </div>
            </div>

            {dof.updated_at !== dof.created_at && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <i className="bi bi-pencil text-warning-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">
                    DÖF kaydı güncellendi
                  </p>
                  <p className="text-xs text-secondary-600">{formatDate(dof.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileName={previewFile.fileName}
          fileType={previewFile.fileType}
          fileSize={previewFile.fileSize}
          fileUrl={previewFile.fileUrl}
          uploadedBy={previewFile.uploadedBy}
          uploadedAt={previewFile.uploadedAt}
          onDownload={async () => {
            if (previewFile.fileUrl) {
              try {
                const response = await fetch(previewFile.fileUrl);
                if (!response.ok) throw new Error('Dosya indirilemedi');

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = previewFile.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(blobUrl);
              } catch (error) {
                console.error('Error downloading from preview:', error);
                alert('Dosya indirilirken bir hata oluştu');
              }
            }
          }}
        />
      )}
    </div>
  );
};
