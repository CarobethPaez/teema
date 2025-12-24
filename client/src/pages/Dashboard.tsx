import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import type { Project } from '../services/projectService';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const data = await projectService.getAll();
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectClick = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Task Manager</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + New Project
                    </button>
                    <button
                        className="btn"
                        style={{ border: '1px solid var(--border)' }}
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>No projects yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Get started by creating your first project</p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Project</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                backgroundColor: 'var(--surface)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '1px solid var(--border)'
                            }}
                            onClick={() => handleProjectClick(project.id)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', height: '40px', overflow: 'hidden' }}>
                                {project.description || 'No description'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span>Tasks: {project._count?.tasks || 0}</span>
                                <span>Members: {project._count?.members || 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CreateProjectModal
                    onClose={() => setIsModalOpen(false)}
                    onProjectCreated={fetchProjects}
                />
            )}
        </div>
    );
};

export default Dashboard;
