import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { NotificationCard } from './NotificationCard';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationListProps {
    onPageChange?: (page: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onPageChange }) => {
    const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications();

    const handleNavigate = (type: string, id: string) => {
        if (!onPageChange) {
            console.warn('onPageChange not provided to NotificationList');
            return;
        }

        // Sadece sayfa değiştir, parametreleri şimdilik göz ardı et
        // İleride URL parametresi desteği eklenebilir
        switch (type) {
            case 'dof':
                onPageChange('dof-management');
                break;
            case 'event':
                onPageChange('event-reporting');
                break;
            case 'kanban_card':
                onPageChange('kanban');
                break;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <i className="bi bi-bell mr-2 text-primary-600"></i>
                        Bildirimler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <i className="bi bi-bell mr-2 text-primary-600"></i>
                        Bildirimler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-danger-600">
                        <i className="bi bi-exclamation-circle text-3xl mb-2"></i>
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const displayNotifications = notifications.slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                        <i className="bi bi-bell mr-2 text-primary-600"></i>
                        Bildirimler
                        {unreadNotifications.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-600 text-white rounded-full">
                                {unreadNotifications.length}
                            </span>
                        )}
                    </CardTitle>

                    {unreadNotifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            Tümünü Okundu İşaretle
                        </button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {displayNotifications.length === 0 ? (
                    <div className="text-center py-8 text-secondary-500">
                        <i className="bi bi-bell-slash text-4xl mb-3 block"></i>
                        <p className="text-sm">Henüz bildiriminiz yok</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
