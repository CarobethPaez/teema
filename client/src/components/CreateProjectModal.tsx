import { useState } from 'react';
import { projectService } from '../services/projectService';

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated: () => void;
}

const CreateProjectModal = ({ onClose, onProjectCreated }: CreateProjectModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await projectService.create({ name, description });
            onProjectCreated();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to create project';
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
                <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Name</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="My Awesome Project"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What's this project about?"
                            style={{ resize: 'vertical' }}
                        />
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
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
