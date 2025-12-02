import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const VersionDisplay: React.FC = () => {
    const { currentOrganization } = useAuth();
    const version = '1.0.0'; // This will be replaced by build process

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-500 border border-gray-200">
            <div className="flex items-center gap-2">
                <div>
                    <div className="font-semibold text-gray-700">
                        {currentOrganization?.name || 'Sistem'}
                    </div>
                    <div>Versiyon: v{version}</div>
                </div>
            </div>
        </div>
    );
};
