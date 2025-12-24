import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { Trash2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import TaskComments from './TaskComments';

interface TaskCardProps {
    task: Task;
    onTaskUpdated: () => void;
}

const TaskCard = ({ task, onTaskUpdated }: TaskCardProps) => {
    const [showComments, setShowComments] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            await taskService.update(task.id, { status: e.target.value as 'todo' | 'in-progress' | 'done' });
            onTaskUpdated();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
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
                    title="Delete task"
                >
                    <Trash2 size={16} />
                </button>
            </div>

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
                            <span style={{ color: 'var(--text-secondary)' }}>Unassigned</span>
                        )}
                    </div>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}
                    >
                        <MessageSquare size={14} />
                        <span>Comments</span>
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
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {showComments && <TaskComments taskId={task.id} />}
        </div>
    );
};

export default TaskCard;
