import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import styles from '../components/Dashboard/Dashboard.module.css';

const CreateProject: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const newProject = await projectService.create({
                name: name.trim(),
                description: description.trim()
            });
            navigate(`/projects/${newProject.id}`);
        } catch (err) {
            console.error('Failed to create project', err);
            setError('Error al crear el proyecto. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Crear Nuevo Proyecto</h1>
                    <p>Comienza una nueva aventura, <strong>{user?.name}</strong></p>
                </div>
                <button onClick={() => navigate('/')} className={styles.cancelBtn}>
                    Cancelar
                </button>
            </header>

            <main className={styles.mainContent} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className={styles.statCard} style={{ textAlign: 'left', padding: '2rem' }}>
                    {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre del Proyecto</label>
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

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descripción (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe brevemente de qué trata este proyecto..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.addButton}
                            disabled={isLoading}
                            style={{ width: '100%', padding: '1rem' }}
                        >
                            {isLoading ? 'Creando...' : 'Crear Proyecto'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateProject;
