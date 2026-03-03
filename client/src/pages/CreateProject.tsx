import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import styles from '../components/Dashboard/Dashboard.module.css';

const CreateProject: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const newProject = await projectService.create({
                name: name.trim(),
                description: description.trim()
            });
            navigate(`/projects/${newProject.id}`);
        } catch (err) {
            console.error('Failed to create project', err);
            setError(t('projects.error_create'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>{t('projects.create_title')}</h1>
                    <p>{t('common.welcome')}, <strong>{user?.name}</strong></p>
                </div>
                <button onClick={() => navigate('/')} className={styles.cancelBtn}>
                    {t('common.cancel')}
                </button>
            </header>

            <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '600px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>{t('projects.create_title')}</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('projects.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Rediseño de marca"
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('projects.description')}</label>
                        <textarea
                            className="input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => navigate('/')}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.loading') : t('projects.create_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
