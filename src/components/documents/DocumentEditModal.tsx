import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DocumentCategory, Document, DocumentFormData } from '../../types/documents';

interface DocumentEditModalProps {
    document: Document;
    categories: DocumentCategory[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<DocumentFormData>) => Promise<void>;
    loading?: boolean;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
    document,
    categories,
    isOpen,
    onClose,
    onUpdate,
    loading = false,
}) => {
    const [formData, setFormData] = useState<Partial<DocumentFormData>>({
        title: '',
        description: '',
        category_id: '',
        is_downloadable: true,
    });

    useEffect(() => {
        if (document) {
            setFormData({
                title: document.title,
                description: document.description || '',
                category_id: document.category_id,
                is_downloadable: document.is_downloadable,
            });
        }
    }, [document]);

    // Check if current category is restricted (Procedure or Instruction)
    const isRestrictedCategory = React.useMemo(() => {
        if (!formData.category_id) return false;
        const category = categories.find(c => c.id === formData.category_id);
        if (!category) return false;
        const name = category.name.toLowerCase();
        return name.includes('prosed') || name.includes('talimat');
    }, [formData.category_id, categories]);

    // Update is_downloadable when category changes
    useEffect(() => {
        if (isRestrictedCategory) {
            setFormData(prev => ({ ...prev, is_downloadable: false }));
        }
    }, [isRestrictedCategory]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, category_id: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            alert('Lütfen doküman başlığı girin.');
            return;
        }

        if (!formData.category_id) {
            alert('Lütfen bir kategori seçin.');
            return;
        }

        try {
            await onUpdate(document.id, formData);
            onClose();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const categoryOptions = [
        { value: '', label: 'Kategori Seçiniz' },
        ...categories.map(category => ({
            value: category.id,
            label: category.name
        }))
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-secondary-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-white mb-4">
                            Doküman Düzenle
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Input
                                    label="Doküman Başlığı"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Doküman başlığını girin"
                                    required
                                />
                            </div>

                            <div>
                                <Textarea
                                    label="Açıklama"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Doküman açıklamasını girin (opsiyonel)"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Select
                                    label="Kategori"
                                    value={formData.category_id}
                                    onChange={handleSelectChange}
                                    options={categoryOptions}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_downloadable"
                                    name="is_downloadable"
                                    checked={formData.is_downloadable}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_downloadable: e.target.checked }))}
                                    disabled={isRestrictedCategory}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label htmlFor="edit_is_downloadable" className={`text-sm font-medium select-none ${isRestrictedCategory ? 'text-secondary-400' : 'text-secondary-700'}`}>
                                    {isRestrictedCategory
                                        ? 'Bu kategori için doküman indirme kısıtlanmıştır'
                                        : 'Doküman İndirilebilir'}
                                </label>
                            </div>

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button
                                    type="submit"
                                    className="w-full justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                                    disabled={loading}
                                >
                                    {loading ? 'Güncelleniyor...' : 'Güncelle'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-3 w-full justify-center rounded-md border shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    İptal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
