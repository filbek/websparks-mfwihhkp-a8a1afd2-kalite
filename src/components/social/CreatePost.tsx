import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface CreatePostProps {
    onSubmit: (content: string, imageFile?: File) => Promise<boolean>;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await onSubmit(content, selectedFile as any); // Cast as any because prop type expects string but we changed it in hook. wait.
            // Wait, CreatePostProps defines onSubmit: (content: string, imageUrl?: string) => Promise<boolean>;
            // But useSocial hook createPost now accepts (content: string, imageFile?: File)
            // I need to update the interface here too or let the parent handle it. 
            // The parent <SocialWall> passes `handleCreatePost` which calls `createPost(content, imageUrl)`. 
            // `createPost` in useSocial was updated to take `File`.
            // So `handleCreatePost` in `SocialWall.tsx` needs to accept `File` and pass it to `createPost`.

            setContent('');
            setSelectedFile(undefined);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <i className="bi bi-person-fill text-xl text-primary-600 dark:text-primary-400"></i>
                        </div>
                    </div>
                    <div className="flex-grow space-y-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Neler paylaşmak istersiniz?"
                            className="w-full bg-secondary-50 dark:bg-secondary-900 border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 min-h-[80px] text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 resize-none"
                        />
                        {previewUrl && (
                            <div className="relative inline-block">
                                <img src={previewUrl} alt="Preview" className="h-32 rounded-lg object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(undefined);
                                        setPreviewUrl(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3 pl-14">
                    <div className="flex space-x-2">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <i className="bi bi-image mr-2"></i>
                            Fotoğraf
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        disabled={!content.trim() || loading}
                        loading={loading}
                    >
                        Paylaş
                    </Button>
                </div>
            </form>
        </div>
    );
};
