import React from 'react';
import { Board } from '../../lib/kanbanApi';
import { ChevronDown, Trash2 } from 'lucide-react';

interface BoardSelectorProps {
    boards: Board[];
    currentBoardId: string | null;
    onSelectBoard: (boardId: string) => void;
    onDeleteBoard: (boardId: string) => void;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
    boards,
    currentBoardId,
    onSelectBoard,
    onDeleteBoard,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const currentBoard = boards.find(b => b.id === currentBoardId);

    const handleDelete = (e: React.MouseEvent, boardId: string) => {
        e.stopPropagation();
        if (confirm('Bu panoyu silmek istediğinizden emin misiniz? Tüm listeler ve kartlar silinecektir.')) {
            onDeleteBoard(boardId);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
                <span className="font-medium text-secondary-900 dark:text-white">
                    {currentBoard ? currentBoard.title : 'Pano Seçin'}
                </span>
                <ChevronDown className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto transition-colors">
                        {boards.length === 0 ? (
                            <div className="p-4 text-sm text-secondary-500 dark:text-secondary-400 text-center">
                                Henüz pano yok
                            </div>
                        ) : (
                            boards.map(board => (
                                <div
                                    key={board.id}
                                    className={`flex items-center justify-between px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700 cursor-pointer transition-colors ${board.id === currentBoardId ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                        }`}
                                    onClick={() => {
                                        onSelectBoard(board.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white truncate flex-1">
                                        {board.title}
                                    </span>
                                    {boards.length > 1 && (
                                        <button
                                            onClick={(e) => handleDelete(e, board.id)}
                                            className="ml-2 p-1 text-secondary-400 hover:text-danger-600 dark:text-secondary-500 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
