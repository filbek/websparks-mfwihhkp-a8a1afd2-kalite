import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { MoreHorizontal, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { User } from '../../types';

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignedTo?: string;
}

interface KanbanListProps {
    id: string;
    title: string;
    tasks: Task[];
    users?: User[];
    onCardClick?: (task: Task) => void;
    onAddCard?: () => void;
    onDeleteList?: () => void;
    onDeleteCard?: (cardId: string) => void;
    onEditTitle?: (newTitle: string) => void;
}

export const KanbanList: React.FC<KanbanListProps> = ({
    id,
    title,
    tasks,
    users = [],
    onCardClick,
    onAddCard,
    onDeleteList,
    onDeleteCard,
    onEditTitle,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [showMenu, setShowMenu] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: 'Column',
            column: { id, title, tasks },
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleTitleSave = () => {
        if (editedTitle.trim() && editedTitle !== title) {
            onEditTitle?.(editedTitle.trim());
        } else {
            setEditedTitle(title);
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-secondary-100 dark:bg-secondary-900 rounded-lg p-3 w-80 flex-shrink-0 flex flex-col max-h-full transition-colors"
        >
            <div className="flex items-center justify-between mb-3 p-1">
                {isEditing ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTitleSave();
                            if (e.key === 'Escape') {
                                setEditedTitle(title);
                                setIsEditing(false);
                            }
                        }}
                        className="flex-1 px-2 py-1 text-sm font-semibold text-secondary-900 dark:text-white bg-white dark:bg-secondary-800 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                    />
                ) : (
                    <h3
                        {...attributes}
                        {...listeners}
                        className="font-semibold text-secondary-700 dark:text-secondary-200 cursor-grab active:cursor-grabbing flex-1"
                    >
                        {title}
                    </h3>
                )}

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 p-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg z-20">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Başlığı Düzenle
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bu listeyi ve içindeki tüm kartları silmek istediğinizden emin misiniz?')) {
                                            onDeleteList?.();
                                        }
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Listeyi Sil
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[100px]">
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            {...task}
                            users={users}
                            onClick={() => onCardClick?.(task)}
                            onDelete={() => onDeleteCard?.(task.id)}
                        />
                    ))}
                </SortableContext>
            </div>

            <Button
                variant="ghost"
                className="mt-2 w-full justify-start text-secondary-500 hover:text-secondary-700 hover:bg-secondary-200 dark:text-secondary-400 dark:hover:text-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                onClick={onAddCard}
            >
                <Plus className="w-4 h-4 mr-2" />
                Kart Ekle
            </Button>
        </div>
    );
};
