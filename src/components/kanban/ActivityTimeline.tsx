import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import * as activityApi from '../../lib/activityApi';

interface ActivityTimelineProps {
    cardId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ cardId }) => {
    const [activities, setActivities] = useState<activityApi.Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivity();
    }, [cardId]);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const data = await activityApi.fetchActivity(cardId);
            setActivities(data);
        } catch (error) {
            console.error('Error loading activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionText = (activity: activityApi.Activity) => {
        const user = activity.user?.display_name || 'Kullanıcı';

        switch (activity.action_type) {
            case 'card_created':
                return `${user} kartı oluşturdu`;
            case 'card_updated':
                return `${user} kartı güncelledi`;
            case 'card_completed':
                return `${user} kartı tamamladı`;
            case 'card_reopened':
                return `${user} kartı yeniden açtı`;
            case 'checklist_added':
                return `${user} kontrol listesi ekledi`;
            case 'attachment_added':
                return `${user} dosya ekledi`;
            case 'comment_added':
                return `${user} yorum ekledi`;
            case 'assigned':
                return `${user} görevi atadı`;
            default:
                return `${user} bir işlem yaptı`;
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <ActivityIcon className="w-4 h-4 mr-2" />
                Aktivite
            </h3>

            {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                    Henüz aktivite yok
                </p>
            ) : (
                <div className="space-y-3">
                    {activities.map(activity => (
                        <div key={activity.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <ActivityIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                    {getActionText(activity)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(activity.created_at).toLocaleString('tr-TR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
