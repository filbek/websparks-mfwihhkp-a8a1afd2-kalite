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
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900">
                    {currentBoard ? currentBoard.title : 'Pano Seçin'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                        {boards.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                Henüz pano yok
                            </div>
                        ) : (
                            boards.map(board => (
                                <div
                                    key={board.id}
                                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${board.id === currentBoardId ? 'bg-primary-50' : ''
                                        }`}
                                    onClick={() => {
                                        onSelectBoard(board.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                                        {board.title}
                                    </span>
                                    {boards.length > 1 && (
                                        <button
                                            onClick={(e) => handleDelete(e, board.id)}
                                            className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
