import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FacilityData {
  id: number;
  name: string;
  activeDofs: number;
  activeEvents: number;
  completedThisMonth: number;
  status: 'normal' | 'warning' | 'critical';
}

const mockFacilities: FacilityData[] = [
  {
    id: 1,
    name: 'Silivri',
    activeDofs: 12,
    activeEvents: 8,
    completedThisMonth: 25,
    status: 'normal'
  },
  {
    id: 2,
    name: 'Avcılar',
    activeDofs: 18,
    activeEvents: 15,
    completedThisMonth: 32,
    status: 'warning'
  },
  {
    id: 3,
    name: 'Ereğli',
    activeDofs: 7,
    activeEvents: 4,
    completedThisMonth: 18,
    status: 'normal'
  }
];

export const FacilityOverview: React.FC = () => {
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
          {mockFacilities.map((facility) => (
            <div key={facility.id} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-secondary-900">
                  {facility.name} Şubesi
                </h4>
                {getStatusBadge(facility.status)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{facility.activeDofs}</p>
                  <p className="text-secondary-600">Aktif DÖF</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning-600">{facility.activeEvents}</p>
                  <p className="text-secondary-600">Aktif Olay</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-600">{facility.completedThisMonth}</p>
                  <p className="text-secondary-600">Bu Ay Tamamlanan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
