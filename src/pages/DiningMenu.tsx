import React, { useState, useEffect } from 'react';
import { useSocial } from '../hooks/useSocial';
import { DiningMenu as DiningMenuType } from '../types/social';
import { MenuCard } from '../components/dining/MenuCard';
import { Button } from '../components/ui/Button';

const DiningMenu: React.FC = () => {
    const { fetchMenu, updateMenu } = useSocial();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [menu, setMenu] = useState<DiningMenuType | null>(null);
    const [loading, setLoading] = useState(false);

    // Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        soup: '',
        main_dish: '',
        side_dish: '',
        dessert: ''
    });

    useEffect(() => {
        loadMenu(currentDate);
    }, [currentDate]);

    const loadMenu = async (date: Date) => {
        setLoading(true);
        const data = await fetchMenu(date);
        setMenu(data);
        if (data) {
            setFormData({
                soup: data.soup || '',
                main_dish: data.main_dish || '',
                side_dish: data.side_dish || '',
                dessert: data.dessert || ''
            });
        } else {
            setFormData({ soup: '', main_dish: '', side_dish: '', dessert: '' });
        }
        setLoading(false);
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMenu({
                ...formData,
                date: currentDate.toISOString().split('T')[0]
            });
            setIsEditing(false);
            loadMenu(currentDate);
        } catch (error) {
            console.error('Failed to save menu', error);
            alert('Menü kaydedilirken bir hata oluştu.');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Yemek Listesi</h1>
                    <p className="text-secondary-600 dark:text-secondary-400">
                        Hastanemiz yemekhanesi haftalık yemek menüsü.
                    </p>
                </div>
                <div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <i className="bi bi-pencil mr-2"></i>
                            Düzenle
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-danger-600">
                            İptal
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
                <Button variant="ghost" onClick={handlePrevDay}>
                    <i className="bi bi-chevron-left text-xl"></i>
                </Button>
                <div className="text-center min-w-[200px]">
                    <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                        {currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-secondary-500 dark:text-secondary-400">
                        {currentDate.toLocaleDateString('tr-TR', { weekday: 'long' })}
                    </p>
                </div>
                <Button variant="ghost" onClick={handleNextDay}>
                    <i className="bi bi-chevron-right text-xl"></i>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Display Card */}
                <div className="h-full">
                    <MenuCard menu={isEditing ? { ...menu, ...formData } as any : menu} date={currentDate} loading={loading && !isEditing} />
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Menü Düzenle</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Çorba</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 rounded-lg px-3 py-2 text-secondary-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.soup}
                                    onChange={e => setFormData({ ...formData, soup: e.target.value })}
                                    placeholder="Örn: Mercimek Çorbası"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ana Yemek</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 rounded-lg px-3 py-2 text-secondary-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.main_dish}
                                    onChange={e => setFormData({ ...formData, main_dish: e.target.value })}
                                    placeholder="Örn: Orman Kebabı"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Yardımcı Yemek</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 rounded-lg px-3 py-2 text-secondary-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.side_dish}
                                    onChange={e => setFormData({ ...formData, side_dish: e.target.value })}
                                    placeholder="Örn: Pirinç Pilavı"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tatlı / Meyve</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 rounded-lg px-3 py-2 text-secondary-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.dessert}
                                    onChange={e => setFormData({ ...formData, dessert: e.target.value })}
                                    placeholder="Örn: Kemalpaşa Tatlısı"
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" loading={loading}>
                                    Kaydet
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiningMenu;
