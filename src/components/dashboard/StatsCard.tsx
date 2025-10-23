import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <i className={`bi ${trend.isPositive ? 'bi-arrow-up' : 'bi-arrow-down'} text-sm mr-1 ${
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                }`}></i>
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-secondary-600 ml-1">geçen aya göre</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <i className={`bi ${icon} text-xl`}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
