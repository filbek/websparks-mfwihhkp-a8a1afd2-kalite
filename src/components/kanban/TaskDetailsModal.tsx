import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { CheckSquare } from 'lucide-react';
import { User } from '../../types';
import { ChecklistSection } from './ChecklistSection';
import { AttachmentsSection } from './AttachmentsSection';
import { CommentsSection } from './CommentsSection';
import { ActivityTimeline } from './ActivityTimeline';
import * as kanbanApi from '../../lib/kanbanApi';

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignedTo?: string;
    isCompleted?: boolean;
}

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    users: User[];
    onSave: (updatedTask: Task) => void;
}

type TabType = 'details' | 'checklists' | 'attachments' | 'comments' | 'activity';

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    isOpen,
    onClose,
    task,
    users,
    onSave,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [dueDate, setDueDate] = useState(task.dueDate || '');
    const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');
    const [isCompleted, setIsCompleted] = useState(task.isCompleted || false);

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setAssignedTo(task.assignedTo || '');
        setIsCompleted(task.isCompleted || false);
    }, [task]);

    const handleSave = () => {
        onSave({
            ...task,
            title,
            description,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            assignedTo: assignedTo || undefined,
            isCompleted,
        });
        onClose();
    };

    const handleToggleCompletion = async () => {
        try {
            await kanbanApi.toggleCardCompletion(task.id, !isCompleted);
            setIsCompleted(!isCompleted);
        } catch (error) {
            console.error('Error toggling completion:', error);
        }
    };

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.display_name,
    }));

    const tabs = [
        { id: 'details' as TabType, label: 'Detaylar' },
        { id: 'checklists' as TabType, label: 'Kontrol Listeleri' },
        { id: 'attachments' as TabType, label: 'Ekler' },
        { id: 'comments' as TabType, label: 'Yorumlar' },
        { id: 'activity' as TabType, label: 'Aktivite' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Görev Detayları" size="large">
            <div className="flex flex-col h-full">
                {/* Completion Toggle */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <button
                        onClick={handleToggleCompletion}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <CheckSquare className="w-5 h-5" />
                        <span className="font-medium">
                            {isCompleted ? 'Tamamlandı' : 'Tamamlanmadı'}
                        </span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Görev başlığı"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Görev açıklaması"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Son Tarih
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Atanan Kişi
                                    </label>
                                    <Select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        options={[
                                            { value: '', label: 'Seçiniz' },
                                            ...userOptions,
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'checklists' && <ChecklistSection cardId={task.id} />}
                    {activeTab === 'attachments' && <AttachmentsSection cardId={task.id} />}
                    {activeTab === 'comments' && <CommentsSection cardId={task.id} />}
                    {activeTab === 'activity' && <ActivityTimeline cardId={task.id} />}
                </div>

                {/* Footer - only show save button on details tab */}
                {activeTab === 'details' && (
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            İptal
                        </Button>
                        <Button onClick={handleSave}>Kaydet</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
