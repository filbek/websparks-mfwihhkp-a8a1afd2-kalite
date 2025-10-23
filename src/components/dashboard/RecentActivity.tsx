import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';

interface ActivityItem {
  id: string;
  type: 'dof' | 'event';
  title: string;
  facility: string;
  status: string;
  createdAt: string;
  priority?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'dof',
    title: 'Hasta Düşme Olayı - Acil Servis',
    facility: 'Silivri',
    status: 'atanan',
    createdAt: '2024-01-15T10:30:00Z',
    priority: 'yüksek'
  },
  {
    id: '2',
    type: 'event',
    title: 'İlaç Hata Bildirimi',
    facility: 'Avcılar',
    status: 'çözüm_bekleyen',
    createdAt: '2024-01-15T09:15:00Z',
    priority: 'orta'
  },
  {
    id: '3',
    type: 'dof',
    title: 'Enfeksiyon Kontrol Eksikliği',
    facility: 'Ereğli',
    status: 'kapatma_onayında',
    createdAt: '2024-01-14T16:45:00Z',
    priority: 'düşük'
  }
];

export const RecentActivity: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'atanan':
        return <Badge variant="info">Atanan</Badge>;
      case 'çözüm_bekleyen':
        return <Badge variant="warning">Çözüm Bekleyen</Badge>;
      case 'kapatma_onayında':
        return <Badge variant="success">Kapatma Onayında</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'yüksek':
        return <Badge variant="danger">Yüksek</Badge>;
      case 'orta':
        return <Badge variant="warning">Orta</Badge>;
      case 'düşük':
        return <Badge variant="success">Düşük</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="bi bi-clock-history mr-2 text-primary-600"></i>
          Son Aktiviteler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-secondary-50 rounded-lg">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activity.type === 'dof' ? 'bg-primary-100 text-primary-600' : 'bg-warning-100 text-warning-600'
              }`}>
                <i className={`bi ${activity.type === 'dof' ? 'bi-clipboard-check' : 'bi-exclamation-triangle'}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-1">
                      {activity.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-secondary-600">
                      <span>{activity.facility} Şubesi</span>
                      <span>•</span>
                      <span>{formatDate(activity.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {activity.priority && getPriorityBadge(activity.priority)}
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
