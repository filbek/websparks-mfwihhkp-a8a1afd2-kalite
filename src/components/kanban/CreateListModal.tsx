import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateList: (title: string) => Promise<void>;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
    isOpen,
    onClose,
    onCreateList,
}) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onCreateList(title);
            setTitle('');
            onClose();
        } catch (error) {
            console.error('Error creating list:', error);
            alert('Liste oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yeni Liste Oluştur">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Liste Adı
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Yapılacaklar"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
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
