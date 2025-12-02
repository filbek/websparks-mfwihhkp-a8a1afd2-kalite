import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { User } from '../../types';

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateCard: (cardData: {
        title: string;
        description?: string;
        dueDate?: string;
        assignedTo?: string;
    }) => Promise<void>;
    users: User[];
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
    isOpen,
    onClose,
    onCreateCard,
    users,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onCreateCard({
                title,
                description: description || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                assignedTo: assignedTo || undefined,
            });

            // Reset form
            setTitle('');
            setDescription('');
            setDueDate('');
            setAssignedTo('');
            onClose();
        } catch (error) {
            console.error('Error creating card:', error);
            alert('Kart oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.display_name,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yeni Kart Oluştur">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlık *
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Görev başlığı"
                        autoFocus
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
                        rows={3}
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

                <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button onClick={handleCreate} disabled={loading || !title.trim()}>
                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
