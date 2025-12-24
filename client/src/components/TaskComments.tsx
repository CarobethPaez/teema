import { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import type { Comment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Trash2, Send } from 'lucide-react';

interface TaskCommentsProps {
    taskId: string;
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await commentService.getTaskComments(taskId);
                setComments(data);
            } catch (error) {
                console.error('Failed to load comments', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [taskId]);

    useEffect(() => {
        if (!socket) return;

        const handleCommentCreated = (comment: Comment) => {
            if (comment.taskId === taskId) {
                setComments(prev => [...prev, comment]);
            }
        };

        const handleCommentDeleted = ({ id, taskId: deletedTasksId }: { id: string, taskId: string }) => {
            if (deletedTasksId === taskId) {
                setComments(prev => prev.filter(c => c.id !== id));
            }
        };

        socket.on('comment:created', handleCommentCreated);
        socket.on('comment:deleted', handleCommentDeleted);

        return () => {
            socket.off('comment:created', handleCommentCreated);
            socket.off('comment:deleted', handleCommentDeleted);
        };
    }, [socket, taskId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await commentService.create(taskId, newComment);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete comment?')) return;
        try {
            await commentService.delete(id);
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    if (isLoading) return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading comments...</div>;

    return (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h5 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Comments</h5>

            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {comments.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                flexShrink: 0
                            }}>
                                {comment.author?.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{comment.author?.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{comment.content}</p>
                            </div>
                            {user?.id === comment.authorId && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    style={{ color: 'var(--error)', opacity: 0.5, padding: 0, alignSelf: 'flex-start' }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="input"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.6rem' }} disabled={!newComment.trim()}>
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
};

export default TaskComments;
