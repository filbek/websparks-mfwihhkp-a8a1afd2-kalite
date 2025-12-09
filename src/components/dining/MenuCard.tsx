import React from 'react';
import { DiningMenu } from '../../types/social';

interface MenuCardProps {
    menu: DiningMenu | null;
    date: Date;
    loading?: boolean;
    onEdit?: () => void; // Future use
}

export const MenuCard: React.FC<MenuCardProps> = ({ menu, date, loading }) => {
    const formatDate = (d: Date) => {
        return d.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="bg-primary-600 p-4 text-white text-center">
                <h3 className="font-semibold text-lg">{formatDate(date)}</h3>
                <p className="text-primary-100 text-sm opacity-90">Günün Menüsü</p>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-center items-center text-center space-y-4">
                {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                ) : menu ? (
                    <>
                        {menu.soup && (
                            <div className="w-full pb-3 border-b border-secondary-100 dark:border-secondary-700/50">
                                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider block mb-1">Çorba</span>
                                <p className="text-lg font-medium text-secondary-800 dark:text-secondary-200">{menu.soup}</p>
                            </div>
                        )}
                        {menu.main_dish && (
                            <div className="w-full pb-3 border-b border-secondary-100 dark:border-secondary-700/50">
                                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider block mb-1">Ana Yemek</span>
                                <p className="text-lg font-medium text-secondary-800 dark:text-secondary-200">{menu.main_dish}</p>
                            </div>
                        )}
                        {menu.side_dish && (
                            <div className="w-full pb-3 border-b border-secondary-100 dark:border-secondary-700/50">
                                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider block mb-1">Yardımcı Yemek</span>
                                <p className="text-lg font-medium text-secondary-800 dark:text-secondary-200">{menu.side_dish}</p>
                            </div>
                        )}
                        {menu.dessert && (
                            <div className="w-full">
                                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider block mb-1">Tatlı / Meyve</span>
                                <p className="text-lg font-medium text-secondary-800 dark:text-secondary-200">{menu.dessert}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-secondary-500 dark:text-secondary-400">
                        <i className="bi bi-calendar-x text-3xl mb-2 block"></i>
                        <p>Bu tarih için menü bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
