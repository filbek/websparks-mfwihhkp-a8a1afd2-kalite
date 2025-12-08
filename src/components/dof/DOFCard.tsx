import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DOF } from '../../types';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface DOFCardProps {
  dof: DOF;
  onView: (dof: DOF) => void;
  onAssign?: (dof: DOF) => void;
  onDelete: (id: string) => void;
}

export const DOFCard: React.FC<DOFCardProps> = ({
  dof,
  onView,
  onAssign,
  onDelete
}) => {
  const { user } = useAuth();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kartın tıklanmasını engelle
    if (window.confirm('Bu DÖF kaydını silmek istediğinizden emin misiniz?')) {
      onDelete(dof.id);
    }
  };

  const handleCardClick = () => {
    onView(dof);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kartın tıklanmasını engelle
    onView(dof);
  };

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kartın tıklanmasını engelle
    if (onAssign) {
      onAssign(dof);
    }
  };

  // Yeni DÖF mü kontrol et (atanmamış veya atanmayı bekleyen)
  const isUnassigned = !dof.assigned_to || dof.status === 'atanmayı_bekleyen';

  // Atama yapabilir mi kontrol et
  const canAssign = user && (
    dof.dofu_acan === user.id ||
    dof.reporter_id === user.id ||
    user.role.includes('sube_kalite') ||
    user.role.includes('merkez_kalite')
  );

  // Kapatma onayı verebilir mi (sadece DÖF'ü açan VE atanan kişi OLMAYAN)
  const canApprove = user && (
    (dof.dofu_acan === user.id || dof.reporter_id === user.id) &&
    dof.assigned_to !== user.id
  );

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
              {dof.title}
            </h3>
            <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
              {dof.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dof.priority)}`}>
              {dof.priority.charAt(0).toUpperCase() + dof.priority.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dof.status)}`}>
              {getStatusLabel(dof.status)}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-secondary-600">
            <i className="bi bi-building mr-2"></i>
            <span>{dof.facility?.name || 'Bilinmeyen Şube'}</span>
          </div>

          <div className="flex items-center text-sm text-secondary-600">
            <i className="bi bi-person mr-2"></i>
            <span>Rapor Eden: {dof.reporter?.display_name || 'Bilinmeyen'}</span>
          </div>

          {dof.assignee && (
            <div className="flex items-center text-sm text-secondary-600">
              <i className="bi bi-person-check mr-2"></i>
              <span>Atanan: {dof.assignee.display_name}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-secondary-600">
            <i className="bi bi-calendar mr-2"></i>
            <span>Oluşturulma: {formatDate(dof.created_at)}</span>
          </div>

          {dof.due_date && (
            <div className="flex items-center text-sm text-secondary-600">
              <i className="bi bi-calendar-event mr-2"></i>
              <span>Bitiş: {formatDate(dof.due_date)}</span>
            </div>
          )}

          {(dof.comment_count && dof.comment_count > 0) && (
            <div className="flex items-center text-sm text-secondary-600">
              <i className="bi bi-chat-left-text mr-2"></i>
              <span>{dof.comment_count} Yorum</span>
            </div>
          )}

          {dof.last_comment && (
            <div className="mt-2 p-2 bg-secondary-50 rounded border-l-2 border-primary-500">
              <div className="flex items-center text-xs text-secondary-500 mb-1">
                <i className="bi bi-chat mr-1"></i>
                <span className="font-medium">{dof.last_comment.user?.display_name}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(dof.last_comment.created_at)}</span>
              </div>
              <p className="text-sm text-secondary-700 line-clamp-2">{dof.last_comment.comment}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewClick}
            >
              <i className="bi bi-eye mr-1"></i>
              Görüntüle
            </Button>

            {/* Yeni DÖF'lerde Atama Yap butonu göster */}
            {isUnassigned && canAssign && onAssign && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleAssignClick}
              >
                <i className="bi bi-person-plus mr-1"></i>
                Atama Yap
              </Button>
            )}

            {/* Kapatma onayı bekleyen DÖF'lerde sadece açan kişi için Kapatma Onayı Ver butonu */}
            {dof.status === 'kapatma_onayında' && canApprove && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={handleViewClick}
              >
                <i className="bi bi-check-circle mr-1"></i>
                Kapatma Onayı Ver
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
