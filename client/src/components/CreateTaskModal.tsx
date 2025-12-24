import { useState } from 'react';
import { taskService } from '../services/taskService';
import type { Project } from '../services/projectService';

interface CreateTaskModalProps {
    project: Project;
    onClose: () => void;
    onTaskCreated: () => void;
}

const CreateTaskModal = ({ project, onClose, onTaskCreated }: CreateTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await taskService.create({
                title,
                description,
                projectId: project.id,
                assigneeId: assigneeId || undefined
            });
            onTaskCreated();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to create task';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: 'var(--surface)',
                padding: '2rem',
                borderRadius: 'var(--radius)'
            }}>
                <h2 style={{ marginBottom: '1.5rem' }}>New Task</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Fix bug #123"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Details about the task..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign To</label>
                        <select
                            className="input"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {project.members?.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            style={{ border: '1px solid var(--border)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
