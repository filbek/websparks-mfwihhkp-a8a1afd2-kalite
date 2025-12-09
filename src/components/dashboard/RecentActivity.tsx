import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { Activity } from '../../hooks/useDashboardStats';

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'atanan':
        return <Badge variant="info">Atanan</Badge>;
      case 'çözüm_bekleyen':
        return <Badge variant="warning">Çözüm Bekleyen</Badge>;
      case 'kapatma_onayında':
        return <Badge variant="success">Kapatma Onayında</Badge>;
      case 'kapatıldı':
        return <Badge variant="success">Kapatıldı</Badge>;
      case 'reddedildi':
        return <Badge variant="danger">Reddedildi</Badge>;
      default:
        // Replace underscores with spaces and capitalize
        const label = status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
        return <Badge>{label}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    switch (priority) {
      case 'kritik':
        return <Badge variant="danger">Kritik</Badge>;
      case 'yüksek':
        return <Badge variant="warning">Yüksek</Badge>;
      case 'orta':
        return <Badge variant="info">Orta</Badge>;
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
          {activities.length === 0 ? (
            <div className="text-center py-6 text-secondary-500">
              <p>Henüz aktivite bulunmuyor.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-secondary-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'dof' ? 'bg-primary-100 text-primary-600' : 'bg-warning-100 text-warning-600'
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
                        <span>{activity.facility}</span>
                        <span>•</span>
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {activity.priority && getPriorityBadge(activity.priority)}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
