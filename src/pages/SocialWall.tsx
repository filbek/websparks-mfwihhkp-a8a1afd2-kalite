import React, { useState, useEffect } from 'react';
import { useSocial } from '../hooks/useSocial';
import { SocialPost } from '../types/social';
import { CreatePost } from '../components/social/CreatePost';
import { PostCard } from '../components/social/PostCard';

const SocialWall: React.FC = () => {
    const { fetchPosts, createPost } = useSocial();
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const data = await fetchPosts();
        setPosts(data);
        setLoading(false);
    };

    const handleCreatePost = async (content: string, imageFile?: File) => {
        try {
            await createPost(content, imageFile);
            await loadPosts(); // Refresh list
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Sosyal Duvar</h1>
                <p className="text-secondary-600 dark:text-secondary-400">
                    Şubenizden haberler ve paylaşımlar.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Create Post & Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <CreatePost onSubmit={handleCreatePost} />

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-secondary-500">Yükleniyor...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
                                <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="bi bi-chat-square-text text-2xl text-secondary-400"></i>
                                </div>
                                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-1">
                                    Henüz paylaşım yok
                                </h3>
                                <p className="text-secondary-500 dark:text-secondary-400">
                                    İlk paylaşımı siz yapın!
                                </p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Info or Filters (Future) */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-sm">
                        <h3 className="font-semibold text-secondary-900 dark:text-white mb-3">Hakkında</h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Bu alan sadece sizin şubenizdeki çalışanlara özeldir. Paylaşımlarınız diğer şubelerden görülmez.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialWall;
