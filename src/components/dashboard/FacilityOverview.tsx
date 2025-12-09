import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FacilityData {
  facilityId: number;
  facilityName: string;
  activeDofs: number;
  activeEvents: number;
  completedThisMonth: number;
  status: 'normal' | 'warning' | 'critical';
}

interface FacilityOverviewProps {
  facilityStats: FacilityData[];
  loading?: boolean;
}

export const FacilityOverview: React.FC<FacilityOverviewProps> = ({ facilityStats, loading = false }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="success">Normal</Badge>;
      case 'warning':
        return <Badge variant="warning">Dikkat</Badge>;
      case 'critical':
        return <Badge variant="danger">Kritik</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="bi bi-building mr-2 text-primary-600"></i>
            Şube Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <i className="bi bi-arrow-clockwise animate-spin text-2xl text-primary-600"></i>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (facilityStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="bi bi-building mr-2 text-primary-600"></i>
            Şube Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-secondary-600 dark:text-secondary-400">
            Henüz şube verisi bulunmamaktadır.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="bi bi-building mr-2 text-primary-600"></i>
          Şube Durumu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {facilityStats.map((facility) => (
            <div key={facility.facilityId} className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {facility.facilityName} Şubesi
                </h4>
                {getStatusBadge(facility.status)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{facility.activeDofs}</p>
                  <p className="text-secondary-600 dark:text-secondary-400">Aktif DÖF</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning-600">{facility.activeEvents}</p>
                  <p className="text-secondary-600 dark:text-secondary-400">Aktif Olay</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-600">{facility.completedThisMonth}</p>
                  <p className="text-secondary-600 dark:text-secondary-400">Bu Ay Tamamlanan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
