import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DOF } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';

interface DOFCardProps {
  dof: DOF;
  onEdit: (dof: DOF) => void;
  onDelete: (id: string) => void;
  onView: (dof: DOF) => void;
}

export const DOFCard: React.FC<DOFCardProps> = ({
  dof,
  onEdit,
  onDelete,
  onView
}) => {
  const handleDelete = () => {
    if (window.confirm('Bu DÖF kaydını silmek istediğinizden emin misiniz?')) {
      onDelete(dof.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              {dof.status.replace('_', ' ').charAt(0).toUpperCase() + dof.status.replace('_', ' ').slice(1)}
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
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(dof)}
            >
              <i className="bi bi-eye mr-1"></i>
              Görüntüle
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(dof)}
            >
              <i className="bi bi-pencil mr-1"></i>
              Düzenle
            </Button>
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
