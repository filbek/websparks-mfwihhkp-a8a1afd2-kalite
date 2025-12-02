import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import * as checklistApi from '../../lib/checklistApi';

interface ChecklistSectionProps {
    cardId: string;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ cardId }) => {
    const [checklists, setChecklists] = useState<checklistApi.Checklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [newChecklistTitle, setNewChecklistTitle] = useState('');
    const [newItemTitles, setNewItemTitles] = useState<{ [key: string]: string }>({});
    const [showNewChecklist, setShowNewChecklist] = useState(false);

    useEffect(() => {
        loadChecklists();
    }, [cardId]);

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await checklistApi.fetchChecklists(cardId);
            setChecklists(data);
        } catch (error) {
            console.error('Error loading checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChecklist = async () => {
        if (!newChecklistTitle.trim()) return;

        try {
            const newChecklist = await checklistApi.createChecklist(cardId, newChecklistTitle);
            setChecklists([...checklists, newChecklist]);
            setNewChecklistTitle('');
            setShowNewChecklist(false);
        } catch (error) {
            console.error('Error creating checklist:', error);
        }
    };

    const handleDeleteChecklist = async (checklistId: string) => {
        if (!confirm('Bu kontrol listesini silmek istediğinizden emin misiniz?')) return;

        try {
            await checklistApi.deleteChecklist(checklistId);
            setChecklists(checklists.filter(c => c.id !== checklistId));
        } catch (error) {
            console.error('Error deleting checklist:', error);
        }
    };

    const handleAddItem = async (checklistId: string) => {
        const title = newItemTitles[checklistId];
        if (!title?.trim()) return;

        try {
            const newItem = await checklistApi.createChecklistItem(checklistId, title);
            setChecklists(checklists.map(c =>
                c.id === checklistId
                    ? { ...c, items: [...(c.items || []), newItem] }
                    : c
            ));
            setNewItemTitles({ ...newItemTitles, [checklistId]: '' });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleToggleItem = async (checklistId: string, itemId: string, isCompleted: boolean) => {
        try {
            await checklistApi.toggleChecklistItem(itemId, isCompleted);
            setChecklists(checklists.map(c =>
                c.id === checklistId
                    ? {
                        ...c,
                        items: (c.items || []).map(item =>
                            item.id === itemId ? { ...item, is_completed: isCompleted } : item
                        ),
                    }
                    : c
            ));
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const handleDeleteItem = async (checklistId: string, itemId: string) => {
        try {
            await checklistApi.deleteChecklistItem(itemId);
            setChecklists(checklists.map(c =>
                c.id === checklistId
                    ? { ...c, items: (c.items || []).filter(item => item.id !== itemId) }
                    : c
            ));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const getProgress = (checklist: checklistApi.Checklist) => {
        const items = checklist.items || [];
        if (items.length === 0) return 0;
        const completed = items.filter(i => i.is_completed).length;
        return Math.round((completed / items.length) * 100);
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Kontrol Listeleri
                </h3>
                {!showNewChecklist && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowNewChecklist(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Ekle
                    </Button>
                )}
            </div>

            {showNewChecklist && (
                <div className="flex gap-2">
                    <Input
                        placeholder="Liste adı..."
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateChecklist()}
                        autoFocus
                    />
                    <Button size="sm" onClick={handleCreateChecklist}>Ekle</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewChecklist(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {checklists.map(checklist => {
                const progress = getProgress(checklist);
                const items = checklist.items || [];

                return (
                    <div key={checklist.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{checklist.title}</h4>
                            <button
                                onClick={() => handleDeleteChecklist(checklist.id)}
                                className="text-gray-400 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{progress}%</span>
                                <span>{items.filter(i => i.is_completed).length}/{items.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center gap-2 group">
                                    <input
                                        type="checkbox"
                                        checked={item.is_completed}
                                        onChange={(e) => handleToggleItem(checklist.id, item.id, e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <span className={`flex-1 text-sm ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {item.title}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteItem(checklist.id, item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Yeni öğe ekle..."
                                    value={newItemTitles[checklist.id] || ''}
                                    onChange={(e) => setNewItemTitles({ ...newItemTitles, [checklist.id]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(checklist.id)}
                                    className="text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleAddItem(checklist.id)}
                                    disabled={!newItemTitles[checklist.id]?.trim()}
                                >
                                    Ekle
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {checklists.length === 0 && !showNewChecklist && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Henüz kontrol listesi yok
                </p>
            )}
        </div>
    );
};
