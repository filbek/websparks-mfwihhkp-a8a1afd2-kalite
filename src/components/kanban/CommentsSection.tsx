import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import * as commentApi from '../../lib/commentApi';
import { useAuth } from '../../contexts/AuthContext';

interface CommentsSectionProps {
    cardId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ cardId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<commentApi.Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [cardId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentApi.fetchComments(cardId);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const comment = await commentApi.createComment(cardId, newComment);
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error creating comment:', error);
            alert('Yorum eklenirken bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (id: string) => {
        if (!editContent.trim()) return;

        try {
            const updated = await commentApi.updateComment(id, editContent);
            setComments(comments.map(c => c.id === id ? updated : c));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Yorum güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

        try {
            await commentApi.deleteComment(id);
            setComments(comments.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Yorum silinirken bir hata oluştu');
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Yorumlar
            </h3>

            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary-700">
                                {comment.user?.display_name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                    {comment.user?.display_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString('tr-TR')}
                                </span>
                            </div>

                            {editingId === comment.id ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleEdit(comment.id)}>
                                            Kaydet
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditContent('');
                                            }}
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                    {user?.id === comment.user_id && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setEditContent(comment.content);
                                                }}
                                                className="text-xs text-gray-500 hover:text-primary-600 flex items-center"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-xs text-gray-500 hover:text-red-600 flex items-center"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Sil
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Henüz yorum yok
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Textarea
                    placeholder="Yorum yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || submitting}
                    className="w-full"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
                </Button>
            </div>
        </div>
    );
};
