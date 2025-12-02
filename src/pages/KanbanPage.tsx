import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskDetailsModal } from '../components/kanban/TaskDetailsModal';
import { CreateBoardModal } from '../components/kanban/CreateBoardModal';
import { CreateCardModal } from '../components/kanban/CreateCardModal';
import { CreateListModal } from '../components/kanban/CreateListModal';
import { MyTasksPanel } from '../components/kanban/MyTasksPanel';
import { BoardSelector } from '../components/kanban/BoardSelector';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import * as kanbanApi from '../lib/kanbanApi';

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

export const KanbanPage: React.FC = () => {
    const [boards, setBoards] = useState<kanbanApi.Board[]>([]);
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
    const [lists, setLists] = useState<List[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'boards' | 'myTasks'>('boards');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (currentBoardId) {
            loadBoardData(currentBoardId);
        }
    }, [currentBoardId]);

    const initialize = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchBoards(), fetchUsers()]);
        } catch (err) {
            console.error('Initialization error:', err);
            setError('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchBoards = async () => {
        try {
            const boardsData = await kanbanApi.fetchBoards();
            setBoards(boardsData);

            if (boardsData.length > 0 && !currentBoardId) {
                setCurrentBoardId(boardsData[0].id);
            }
        } catch (err) {
            console.error('Error fetching boards:', err);
            throw err;
        }
    };

    const fetchUsers = async () => {
        try {
            const { data: usersData, error } = await supabase
                .from('users')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;
            if (usersData) {
                setUsers(usersData as User[]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const loadBoardData = async (boardId: string) => {
        try {
            setLoading(true);
            const { lists: listsData } = await kanbanApi.fetchBoardData(boardId);

            const formattedLists = listsData.map(list => ({
                id: list.id,
                title: list.title,
                tasks: list.cards.map(card => ({
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    dueDate: card.due_date,
                    assignedTo: card.assigned_to,
                })),
            }));

            setLists(formattedLists);
        } catch (err) {
            console.error('Error loading board data:', err);
            setError('Pano verileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (title: string) => {
        try {
            const newBoard = await kanbanApi.createBoard(title);
            setBoards([newBoard, ...boards]);
            setCurrentBoardId(newBoard.id);
        } catch (err) {
            console.error('Error creating board:', err);
            alert('Pano oluşturulurken bir hata oluştu');
        }
    };

    const handleDeleteBoard = async (boardId: string) => {
        try {
            await kanbanApi.deleteBoard(boardId);
            const newBoards = boards.filter(b => b.id !== boardId);
            setBoards(newBoards);

            if (boardId === currentBoardId) {
                setCurrentBoardId(newBoards.length > 0 ? newBoards[0].id : null);
                setLists([]);
            }
        } catch (err) {
            console.error('Error deleting board:', err);
            alert('Pano silinirken bir hata oluştu');
        }
    };

    const handleAddList = async (title: string) => {
        if (!currentBoardId) return;

        try {
            const position = lists.length;
            const newList = await kanbanApi.createList(currentBoardId, title, position);

            setLists([...lists, {
                id: newList.id,
                title: newList.title,
                tasks: [],
            }]);
        } catch (err) {
            console.error('Error creating list:', err);
            throw err;
        }
    };

    const handleDeleteList = async (listId: string) => {
        try {
            await kanbanApi.deleteList(listId);
            setLists(lists.filter(l => l.id !== listId));
        } catch (err) {
            console.error('Error deleting list:', err);
            alert('Liste silinirken bir hata oluştu');
        }
    };

    const handleEditListTitle = async (listId: string, newTitle: string) => {
        try {
            await kanbanApi.updateList(listId, { title: newTitle });
            setLists(lists.map(l => l.id === listId ? { ...l, title: newTitle } : l));
        } catch (err) {
            console.error('Error updating list title:', err);
            alert('Liste başlığı güncellenirken bir hata oluştu');
        }
    };

    const handleAddCard = (listId: string) => {
        setSelectedListId(listId);
        setIsCardModalOpen(true);
    };

    const handleCreateCard = async (cardData: any) => {
        if (!selectedListId) return;

        try {
            const list = lists.find(l => l.id === selectedListId);
            if (!list) return;

            const position = list.tasks.length;
            const newCard = await kanbanApi.createCard(selectedListId, {
                title: cardData.title,
                description: cardData.description,
                position,
                due_date: cardData.dueDate,
                assigned_to: cardData.assignedTo,
            });

            setLists(lists.map(l => {
                if (l.id === selectedListId) {
                    return {
                        ...l,
                        tasks: [...l.tasks, {
                            id: newCard.id,
                            title: newCard.title,
                            description: newCard.description,
                            dueDate: newCard.due_date,
                            assignedTo: newCard.assigned_to,
                        }],
                    };
                }
                return l;
            }));
        } catch (err) {
            console.error('Error creating card:', err);
            throw err;
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        try {
            await kanbanApi.deleteCard(cardId);
            setLists(lists.map(l => ({
                ...l,
                tasks: l.tasks.filter(t => t.id !== cardId),
            })));
        } catch (err) {
            console.error('Error deleting card:', err);
            alert('Kart silinirken bir hata oluştu');
        }
    };

    const handleTaskSave = async (updatedTask: Task) => {
        try {
            await kanbanApi.updateCard(updatedTask.id, {
                title: updatedTask.title,
                description: updatedTask.description,
                due_date: updatedTask.dueDate,
                assigned_to: updatedTask.assignedTo,
            });

            setLists(lists.map(l => ({
                ...l,
                tasks: l.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
            })));
        } catch (err) {
            console.error('Error updating card:', err);
            alert('Kart güncellenirken bir hata oluştu');
        }
    };

    const handleDragEnd = async (activeId: string, overId: string, activeType: string, overType: string) => {
        if (activeType === 'Task') {
            // Find which lists contain the active and over items
            let sourceListId = '';
            let targetListId = '';
            let sourceIndex = -1;
            let targetIndex = -1;

            lists.forEach(list => {
                const activeIdx = list.tasks.findIndex(t => t.id === activeId);
                if (activeIdx !== -1) {
                    sourceListId = list.id;
                    sourceIndex = activeIdx;
                }

                if (overType === 'Task') {
                    const overIdx = list.tasks.findIndex(t => t.id === overId);
                    if (overIdx !== -1) {
                        targetListId = list.id;
                        targetIndex = overIdx;
                    }
                } else if (overType === 'Column' && list.id === overId) {
                    targetListId = list.id;
                    targetIndex = list.tasks.length;
                }
            });

            if (!sourceListId || !targetListId) return;

            // Update local state
            const newLists = [...lists];
            const sourceList = newLists.find(l => l.id === sourceListId);
            const targetList = newLists.find(l => l.id === targetListId);

            if (!sourceList || !targetList) return;

            const [movedTask] = sourceList.tasks.splice(sourceIndex, 1);
            targetList.tasks.splice(targetIndex, 0, movedTask);

            setLists(newLists);

            // Update in database
            try {
                await kanbanApi.updateCardPosition(activeId, targetListId, targetIndex);
            } catch (err) {
                console.error('Error updating card position:', err);
                // Revert on error
                loadBoardData(currentBoardId!);
            }
        } else if (activeType === 'Column') {
            // Handle list reordering
            const oldIndex = lists.findIndex(l => l.id === activeId);
            const newIndex = lists.findIndex(l => l.id === overId);

            if (oldIndex === -1 || newIndex === -1) return;

            const newLists = arrayMove(lists, oldIndex, newIndex);
            setLists(newLists);

            // Update positions in database
            try {
                await Promise.all(
                    newLists.map((list, index) =>
                        kanbanApi.updateListPosition(list.id, index)
                    )
                );
            } catch (err) {
                console.error('Error updating list positions:', err);
                loadBoardData(currentBoardId!);
            }
        }
    };

    // Helper function for array reordering
    function arrayMove<T>(array: T[], from: number, to: number): T[] {
        const newArray = [...array];
        const [moved] = newArray.splice(from, 1);
        newArray.splice(to, 0, moved);
        return newArray;
    }

    if (loading && boards.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={initialize}>Tekrar Dene</Button>
                </div>
            </div>
        );
    }

    if (boards.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz Pano Yok</h2>
                    <p className="text-gray-500 mb-6">İlk panonuzu oluşturarak başlayın</p>
                    <Button onClick={() => setIsBoardModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Pano Oluştur
                    </Button>
                </div>

                <CreateBoardModal
                    isOpen={isBoardModalOpen}
                    onClose={() => setIsBoardModalOpen(false)}
                    onCreateBoard={handleCreateBoard}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">İş Takibi</h1>
                    {currentView === 'boards' && (
                        <Button onClick={() => setIsBoardModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Pano
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200">
                    <button
                        onClick={() => setCurrentView('boards')}
                        className={`pb-3 px-1 border-b-2 transition-colors ${currentView === 'boards'
                            ? 'border-primary-600 text-primary-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Panolar
                    </button>
                    <button
                        onClick={() => setCurrentView('myTasks')}
                        className={`pb-3 px-1 border-b-2 transition-colors ${currentView === 'myTasks'
                            ? 'border-primary-600 text-primary-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Bana Atanan Görevler
                    </button>
                </div>

                {/* Board selector - only show in boards view */}
                {currentView === 'boards' && boards.length > 0 && (
                    <div className="mt-4">
                        <BoardSelector
                            boards={boards}
                            currentBoardId={currentBoardId}
                            onSelectBoard={setCurrentBoardId}
                            onDeleteBoard={handleDeleteBoard}
                        />
                    </div>
                )}
            </div>

            {currentView === 'myTasks' ? (
                <div className="flex-1 overflow-auto">
                    <MyTasksPanel />
                </div>
            ) : loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : lists.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Liste Yok</h3>
                        <p className="text-gray-500 mb-4">İlk listenizi oluşturarak başlayın</p>
                        <Button onClick={() => setIsListModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Liste
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard
                        lists={lists}
                        users={users}
                        onCardClick={(task) => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                        }}
                        onAddCard={handleAddCard}
                        onAddList={() => setIsListModalOpen(true)}
                        onDeleteList={handleDeleteList}
                        onDeleteCard={handleDeleteCard}
                        onEditListTitle={handleEditListTitle}
                        onDragEnd={handleDragEnd}
                    />
                </div>
            )}

            {selectedTask && (
                <TaskDetailsModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    task={selectedTask}
                    users={users}
                    onSave={handleTaskSave}
                />
            )}

            <CreateBoardModal
                isOpen={isBoardModalOpen}
                onClose={() => setIsBoardModalOpen(false)}
                onCreateBoard={handleCreateBoard}
            />

            <CreateCardModal
                isOpen={isCardModalOpen}
                onClose={() => {
                    setIsCardModalOpen(false);
                    setSelectedListId(null);
                }}
                onCreateCard={handleCreateCard}
                users={users}
            />

            <CreateListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                onCreateList={handleAddList}
            />
        </div>
    );
};
