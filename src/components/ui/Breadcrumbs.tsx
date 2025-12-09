import React from 'react';

interface BreadcrumbsProps {
    currentPage: string;
}

const pageNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'dof-management': 'DÖF Yönetimi',
    'event-reporting': 'Olay Bildirimi',
    'document-management': 'Doküman Yönetimi',
    'feedback-management': 'Görüş-Öneri',
    'committees': 'Komiteler',
    'reports': 'Raporlar',
    'settings': 'Ayarlar',
    'kanban': 'İş Takibi'
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage }) => {
    const pageName = pageNames[currentPage] || currentPage;

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <span className="inline-flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-400">
                        <i className="bi bi-house-door mr-2"></i>
                        Ana Sayfa
                    </span>
                </li>
                <li>
                    <div className="flex items-center">
                        <i className="bi bi-chevron-right text-secondary-400"></i>
                        <span className="ml-1 text-sm font-medium text-primary-600 dark:text-primary-500 md:ml-2">
                            {pageName}
                        </span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};
