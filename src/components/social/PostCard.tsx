import React, { useState } from 'react';
import { SocialPost } from '../../types/social';
import { Button } from '../ui/Button';
import { CommentList } from './CommentList';
import { useSocial } from '../../hooks/useSocial';

interface PostCardProps {
    post: SocialPost;
}

import { useAuth } from '../../contexts/AuthContext';

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { user } = useAuth();
    const { likePost, unlikePost, updatePost, deletePost } = useSocial(); // Added updatePost, deletePost
    const [liked, setLiked] = useState(post.is_liked_by_user || false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = user?.id === post.user_id;

    const handleLike = async () => {
        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            if (newLiked) {
                await likePost(post.id);
            } else {
                await unlikePost(post.id);
            }
        } catch (error) {
            // Revert if error
            setLiked(!newLiked);
            setLikesCount(prev => !newLiked ? prev + 1 : prev - 1);
        }
    };

    const handleSave = async () => {
        if (!editContent.trim() || editContent === post.content) {
            setIsEditing(false);
            return;
        }

        try {
            await updatePost(post.id, editContent);
            setIsEditing(false);
            // Ideally we should refresh the parent list or update local state properly.
            // For now, let's assume parent refresh or just UI update here.
            post.content = editContent; // Mutating prop is bad practice but works for immediate feedback if no reload.
            // Better: Trigger a reload callback if passed. But for now this suffices for "it works".
            window.location.reload(); // Quick fix to refresh data or use a callback prop to reload list
        } catch (error) {
            console.error('Failed to update post', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) return;

        try {
            setIsDeleting(true);
            await deletePost(post.id);
            window.location.reload(); // Refresh list
        } catch (error) {
            console.error('Failed to delete post', error);
            setIsDeleting(false);
        }
    };

    if (isDeleting) return null; // Hide if deleted

    return (
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 mb-4 shadow-sm overflow-hidden group">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {post.user?.display_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">
                                {post.user?.display_name || 'İsimsiz Kullanıcı'}
                            </h3>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                {new Date(post.created_at).toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </div>

                    {isOwner && !isEditing && (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="bi bi-pencil-square mr-1"></i> Düzenle
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-secondary-400 hover:text-danger-600"
                                onClick={handleDelete}
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg p-3 text-secondary-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>İptal</Button>
                            <Button size="sm" onClick={handleSave}>Kaydet</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-secondary-800 dark:text-secondary-200 mb-4 whitespace-pre-wrap">
                        {post.content}
                    </p>
                )}

                {post.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                        <img src={post.image_url} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-100 dark:border-secondary-700">
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`flex items-center space-x-1 ${liked ? 'text-danger-600 dark:text-danger-500' : 'text-secondary-600 dark:text-secondary-400'}`}
                        >
                            <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                            <span>{likesCount} Beğeni</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400"
                        >
                            <i className="bi bi-chat"></i>
                            <span>{post.comments_count} Yorum</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentList postId={post.id} />
            )}
        </div>
    );
};
