import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanList } from './KanbanList';
import { KanbanCard } from './KanbanCard';
import { createPortal } from 'react-dom';
import { User } from '../../types';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignedTo?: string;
}

interface List {
    id: string;
    title: string;
    tasks: Task[];
}

interface KanbanBoardProps {
    lists: List[];
    users: User[];
    onCardClick: (task: Task) => void;
    onAddCard: (listId: string) => void;
    onAddList: () => void;
    onDeleteList: (listId: string) => void;
    onDeleteCard: (cardId: string) => void;
    onEditListTitle: (listId: string, newTitle: string) => void;
    onDragEnd: (activeId: string, overId: string, activeType: string, overType: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    lists,
    users,
    onCardClick,
    onAddCard,
    onAddList,
    onDeleteList,
    onDeleteCard,
    onEditListTitle,
    onDragEnd,
}) => {
    const [activeColumn, setActiveColumn] = useState<List | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        onDragEnd(String(active.id), String(over.id), activeType, overType);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto h-full pb-4">
                <SortableContext
                    items={lists.map((l) => l.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {lists.map((list) => (
                        <KanbanList
                            key={list.id}
                            {...list}
                            users={users}
                            onCardClick={onCardClick}
                            onAddCard={() => onAddCard(list.id)}
                            onDeleteList={() => onDeleteList(list.id)}
                            onDeleteCard={onDeleteCard}
                            onEditTitle={(newTitle) => onEditListTitle(list.id, newTitle)}
                        />
                    ))}
                </SortableContext>

                <div className="flex-shrink-0">
                    <Button
                        variant="outline"
                        className="w-80 h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        onClick={onAddList}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Liste
                    </Button>
                </div>
            </div>

            {createPortal(
                <DragOverlay>
                    {activeColumn && (
                        <KanbanList
                            id={activeColumn.id}
                            title={activeColumn.title}
                            tasks={activeColumn.tasks}
                            users={users}
                        />
                    )}
                    {activeTask && <KanbanCard {...activeTask} users={users} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};
