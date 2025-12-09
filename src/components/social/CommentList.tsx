import React, { useState, useEffect } from 'react';
import { useSocial } from '../../hooks/useSocial';
import { SocialComment } from '../../types/social';
import { Button } from '../ui/Button';

interface CommentListProps {
    postId: string;
}

export const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { fetchComments, createComment } = useSocial();
    const [comments, setComments] = useState<SocialComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        const data = await fetchComments(postId);
        setComments(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await createComment(postId, newComment);
            setNewComment('');
            await loadComments(); // Reload to show new comment
        } catch (error) {
            console.error('Failed to comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-secondary-500 text-sm p-4">Yükleniyor...</div>;

    return (
        <div className="bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-b-xl border-t border-secondary-200 dark:border-secondary-700">
            <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300">
                                    {comment.user?.display_name?.charAt(0) || '?'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-grow bg-white dark:bg-secondary-800 p-3 rounded-lg border border-secondary-200 dark:border-secondary-700">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                                    {comment.user?.display_name || 'İsimsiz Kullanıcı'}
                                </span>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            <p className="text-sm text-secondary-700 dark:text-secondary-300">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorum yap..."
                    className="flex-grow text-sm bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700 rounded-md focus:ring-primary-500 text-secondary-900 dark:text-white"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim() || submitting}>
                    Gönder
                </Button>
            </form>
        </div>
    );
};
