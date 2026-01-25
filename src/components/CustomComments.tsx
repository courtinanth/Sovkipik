import React, { useState, useEffect } from 'react';

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
// const HOST = 'https://cusdis.com'; // Old host
const HOST = ''; // Relative path for proxy

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        nickname: string;
    };
    replies?: Comment[];
}

interface CommentsProps {
    pageId: string;
    pageTitle: string;
    pageUrl: string;
}

export default function CustomComments({ pageId, pageTitle, pageUrl }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [pageId]);

    const fetchComments = async () => {
        try {
            // Use local proxy
            const res = await fetch(`/api/comments?pageId=${pageId}`);
            if (!res.ok) throw new Error('Failed to fetch comments');
            const json = await res.json();

            const list = json.data?.data || json.data || [];
            setComments(Array.isArray(list) ? list : []);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || !nickname) {
            setError('Pseudo et message sont requis.');
            return;
        }
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: APP_ID,
                    content: message,
                    email,
                    nickname,
                    pageId,
                    pageTitle,
                    pageUrl,
                })
            });

            if (res.ok) {
                setMessage('');
                // Optimistic update or refetch
                fetchComments();
            } else {
                setError("Erreur lors de l'envoi.");
            }
        } catch (e) {
            setError("Erreur de connexion.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-earth/20">
            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-12 bg-cream/50 p-6 rounded-xl shadow-sm border border-earth/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-earth mb-1">Pseudo *</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-earth/20 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Votre nom"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-earth mb-1">Email (optionnel)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-earth/20 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Pour la modération"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-earth mb-1">Message *</label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-earth/20 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y"
                        placeholder="Partagez votre avis..."
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Envoi...' : 'Publier le commentaire'}
                </button>
            </form>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <p className="text-earth/60 italic">Chargement des commentaires...</p>
                ) : comments.length === 0 ? (
                    <p className="text-earth/60 italic">Soyez le premier à commenter !</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-forest text-lg">{comment.author.nickname}</span>
                                <span className="text-xs text-earth/50">{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div
                                className="prose prose-sm max-w-none text-earth/80 whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: comment.content }}
                            />

                            {/* Replies would go here recursively if we handle nesting */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-4 pl-4 border-l border-earth/10 space-y-4">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="bg-cream/30 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-forest text-sm">{reply.author.nickname}</span>
                                                <span className="text-xs text-earth/50">{new Date(reply.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <p className="text-sm text-earth/70">{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
