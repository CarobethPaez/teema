import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { Trash2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TaskComments from './TaskComments';

interface TaskCardProps {
    task: Task;
    onTaskUpdated: () => void;
}

const TaskCard = ({ task, onTaskUpdated }: TaskCardProps) => {
    const [showComments, setShowComments] = useState(false);
    const { t } = useTranslation();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            await taskService.update(task.id, { status: e.target.value as 'todo' | 'in-progress' | 'done' });
            onTaskUpdated();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t('tasks.delete_confirm'))) return;
        try {
            await taskService.delete(task.id);
            onTaskUpdated();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const statusColors = {
        'todo': 'var(--text-secondary)',
        'in-progress': 'var(--primary)',
        'done': 'var(--success)'
    };

    return (
        <div className="card" style={{
            padding: '1rem',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: `4px solid ${statusColors[task.status]}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <button
                    onClick={handleDelete}
                    style={{ color: 'var(--error)', opacity: 0.7, padding: '0.2rem' }}
                    title={t('common.delete')}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {(task.priority > 0 || task.dueDate) && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                    {task.priority > 0 && (
                        <span style={{
                            padding: '2px 6px',
                            borderRadius: '12px',
                            backgroundColor: task.priority === 3 ? 'rgba(239, 68, 68, 0.2)' : task.priority === 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: task.priority === 3 ? '#ef4444' : task.priority === 2 ? '#f59e0b' : '#3b82f6',
                            fontWeight: 600
                        }}>
                            {task.priority === 3 ? 'High Priority' : task.priority === 2 ? 'Medium Priority' : 'Low Priority'}
                        </span>
                    )}
                    {task.dueDate && (
                        <span style={{
                            padding: '2px 6px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(107, 114, 128, 0.1)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                        }}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            )}

            {task.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {task.description}
                </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {task.assignee ? (
                            <div title={task.assignee.name} style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem'
                            }}>
                                {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>{t('tasks.unassigned')}</span>
                        )}
                    </div>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}
                    >
                        <MessageSquare size={14} />
                        <span>{t('tasks.comments.title')}</span>
                    </button>
                </div>

                <select
                    value={task.status}
                    onChange={handleStatusChange}
                    style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '0.2rem',
                        fontSize: '0.8rem'
                    }}
                >
                    <option value="todo">{t('tasks.status.todo')}</option>
                    <option value="in-progress">{t('tasks.status.in_progress')}</option>
                    <option value="done">{t('tasks.status.done')}</option>
                </select>
            </div>

            {showComments && <TaskComments taskId={task.id} />}
        </div>
    );
};

export default TaskCard;
