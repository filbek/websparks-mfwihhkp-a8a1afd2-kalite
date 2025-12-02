import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../ui/Card';
import { Calendar, User as UserIcon, Trash2, CheckSquare, Paperclip, MessageSquare } from 'lucide-react';
import { User } from '../../types';

interface KanbanCardProps {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignedTo?: string;
    isCompleted?: boolean;
    users?: User[];
    onClick?: () => void;
    onDelete?: () => void;
    checklistProgress?: { completed: number; total: number };
    attachmentCount?: number;
    commentCount?: number;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
    id,
    title,
    description,
    dueDate,
    assignedTo,
    isCompleted,
    users = [],
    onClick,
    onDelete,
    checklistProgress,
    attachmentCount,
    commentCount,
}) => {
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
            type: 'Task',
            task: { id, title, description, dueDate, assignedTo, isCompleted },
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const assignedUser = users.find(u => u.id === assignedTo);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
            onDelete?.();
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 group">
            <Card
                className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white relative ${isCompleted ? 'opacity-75' : ''
                    }`}
                onClick={onClick}
            >
                {/* Completion Badge */}
                {isCompleted && (
                    <div className="absolute top-2 right-2">
                        <div className="bg-green-100 text-green-700 rounded-full p-1">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <h4 className={`font-medium text-sm text-gray-900 mb-1 flex-1 pr-2 ${isCompleted ? 'line-through text-gray-500' : ''
                        }`}>
                        {title}
                    </h4>
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>

                {description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{description}</p>
                )}

                {/* Checklist Progress */}
                {checklistProgress && checklistProgress.total > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="w-3 h-3 text-gray-400" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{checklistProgress.completed}/{checklistProgress.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                    className={`h-1 rounded-full transition-all ${checklistProgress.completed === checklistProgress.total
                                            ? 'bg-green-500'
                                            : 'bg-primary-500'
                                        }`}
                                    style={{
                                        width: `${(checklistProgress.completed / checklistProgress.total) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-2">
                        {dueDate && (
                            <div className="flex items-center text-xs text-gray-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{new Date(dueDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                        )}

                        {/* Attachment Count */}
                        {attachmentCount && attachmentCount > 0 && (
                            <div className="flex items-center text-xs text-gray-400">
                                <Paperclip className="w-3 h-3 mr-1" />
                                <span>{attachmentCount}</span>
                            </div>
                        )}

                        {/* Comment Count */}
                        {commentCount && commentCount > 0 && (
                            <div className="flex items-center text-xs text-gray-400">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                <span>{commentCount}</span>
                            </div>
                        )}
                    </div>

                    {assignedUser && (
                        <div className="flex items-center text-xs text-gray-600 ml-auto bg-gray-100 px-2 py-1 rounded-full">
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-[100px]">{assignedUser.display_name}</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
