import React from 'react';
import { Notification } from '../../types';
import { formatDate } from '../../lib/utils';

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onNavigate: (type: string, id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onMarkAsRead,
    onNavigate
}) => {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'dof_assignment':
            case 'dof_cc':
                return 'bi-clipboard-check';
            case 'event_assignment':
                return 'bi-exclamation-triangle';
            case 'kanban_assignment':
                return 'bi-kanban';
            default:
                return 'bi-bell';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'dof_assignment':
            case 'dof_cc':
                return 'primary';
            case 'event_assignment':
                return 'warning';
            case 'kanban_assignment':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const handleClick = async () => {
        // Okunmadıysa okundu olarak işaretle
        if (!notification.is_read) {
            await onMarkAsRead(notification.id);
        }

        // İlgili sayfaya yönlendir
        if (notification.related_type && notification.related_id) {
            onNavigate(notification.related_type, notification.related_id);
        }
    };

    const color = getNotificationColor(notification.type);
    const icon = getNotificationIcon(notification.type);

    // Tailwind CSS için explicit class mapping
    const getIconBgClass = () => {
        if (notification.is_read) {
            return 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400';
        }
        switch (color) {
            case 'primary':
                return 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400';
            case 'warning':
                return 'bg-warning-100 dark:bg-warning-900/40 text-warning-600 dark:text-warning-400';
            case 'success':
                return 'bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400';
            default:
                return 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400';
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all ${notification.is_read
                ? 'bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                : 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 border-l-4 border-primary-600 dark:border-primary-500'
                }`}
        >
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgClass()}`}
            >
                <i className={`bi ${icon} text-lg`}></i>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h4 className={`text-sm font-medium mb-1 ${notification.is_read ? 'text-secondary-700 dark:text-secondary-300' : 'text-secondary-900 dark:text-primary-50'
                            }`}>
                            {notification.title}
                        </h4>
                        <p className={`text-sm ${notification.is_read ? 'text-secondary-500 dark:text-secondary-400' : 'text-secondary-700 dark:text-secondary-300'
                            }`}>
                            {notification.message}
                        </p>
                    </div>
                    {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                </div>

                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-secondary-500">
                        {formatDate(notification.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );
};
