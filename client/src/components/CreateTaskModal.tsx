import { useState } from 'react';
import { taskService } from '../services/taskService';
import type { Project } from '../services/projectService';
import { useTranslation } from 'react-i18next';

interface CreateTaskModalProps {
    project: Project;
    onClose: () => void;
    onTaskCreated: () => void;
}

const CreateTaskModal = ({ project, onClose, onTaskCreated }: CreateTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [priority, setPriority] = useState<number>(0);
    const [dueDate, setDueDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await taskService.create({
                title,
                description,
                projectId: project.id,
                assigneeId: assigneeId || undefined,
                priority,
                dueDate: dueDate || null
            });
            onTaskCreated();
            onClose();
        } catch (err: unknown) {
            let errorMessage = t('tasks.error_create');
            if (err instanceof Error) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || err.message;
            }
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
                <h2 style={{ marginBottom: '1.5rem' }}>{t('tasks.new_task')}</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('tasks.title_label')}</label>
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
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('tasks.description_label')}</label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Details about the task..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('tasks.priority', 'Priority')}</label>
                            <select
                                className="input"
                                value={priority}
                                onChange={(e) => setPriority(Number(e.target.value))}
                            >
                                <option value={0}>{t('tasks.priority_none', 'None')}</option>
                                <option value={1}>{t('tasks.priority_low', 'Low')}</option>
                                <option value={2}>{t('tasks.priority_medium', 'Medium')}</option>
                                <option value={3}>{t('tasks.priority_high', 'High')}</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('tasks.due_date', 'Due Date')}</label>
                            <input
                                type="date"
                                className="input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('tasks.assign_to')}</label>
                        <select
                            className="input"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="">{t('tasks.unassigned')}</option>
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
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.loading') : t('tasks.create_task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
