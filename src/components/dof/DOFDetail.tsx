import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DOF } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';

interface DOFDetailProps {
  dof: DOF;
  onEdit: () => void;
  onClose: () => void;
}

export const DOFDetail: React.FC<DOFDetailProps> = ({
  dof,
  onEdit,
  onClose
}) => {
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
              {dof.status.replace('_', ' ').charAt(0).toUpperCase() + dof.status.replace('_', ' ').slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <i className="bi bi-pencil mr-2"></i>
            Düzenle
          </Button>
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
              <Button className="w-full" variant="outline">
                <i className="bi bi-person-plus mr-2"></i>
                Atama Yap
              </Button>
              <Button className="w-full" variant="outline">
                <i className="bi bi-chat-dots mr-2"></i>
                Yorum Ekle
              </Button>
              <Button className="w-full" variant="outline">
                <i className="bi bi-paperclip mr-2"></i>
                Dosya Ekle
              </Button>
              <Button className="w-full" variant="outline">
                <i className="bi bi-arrow-repeat mr-2"></i>
                Durum Değiştir
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline/Comments Section */}
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
    </div>
  );
};
