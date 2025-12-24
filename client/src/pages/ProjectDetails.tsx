import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { Project } from '../services/projectService';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { useSocket } from '../context/SocketContext';
import type { Task } from '../services/taskService';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const { socket } = useSocket();

    const fetchProject = useCallback(async () => {
        if (!id) return;
        try {
            const data = await projectService.getOne(id);
            setProject(data);
        } catch (err: unknown) {
            console.error('Failed to fetch project', err);
            setError('Failed to load project');
            setTimeout(() => navigate('/'), 3000);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit('join_project', id);

        socket.on('task:created', (newTask: Task) => {
            setProject(prev => prev ? {
                ...prev,
                tasks: [...(prev.tasks || []), newTask]
            } : null);
        });

        socket.on('task:updated', (updatedTask: Task) => {
            setProject(prev => prev ? {
                ...prev,
                tasks: (prev.tasks || []).map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            } : null);
        });

        socket.on('task:deleted', ({ id: deletedTaskId }: { id: string }) => {
            setProject(prev => prev ? {
                ...prev,
                tasks: (prev.tasks || []).filter(task => task.id !== deletedTaskId)
            } : null);
        });

        return () => {
            socket.emit('leave_project', id);
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:deleted');
        };
    }, [socket, id]);

    if (isLoading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading project...</div>;
    if (error) return <div className="container" style={{ paddingTop: '2rem', color: 'var(--error)' }}>{error}</div>;
    if (!project) return null;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <button
                    className="btn"
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--text-secondary)' }}
                >
                    &larr; Back to Dashboard
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>{project.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsTaskModalOpen(true)}
                        >
                            + New Task
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--border)' }}>Settings</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                {/* Tasks Column */}
                <div>
                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', minHeight: '200px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Tasks</h3>
                        {project.tasks && project.tasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {project.tasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onTaskUpdated={fetchProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No tasks yet</p>
                        )}
                    </div>
                </div>

                {/* Team Column */}
                <div>
                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Team</h3>
                        <ul style={{ listStyle: 'none' }}>
                            {project.members?.map(member => (
                                <li key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{member.name}</span>
                                    {member.id === project.ownerId && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>Owner</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {isTaskModalOpen && (
                <CreateTaskModal
                    project={project}
                    onClose={() => setIsTaskModalOpen(false)}
                    onTaskCreated={fetchProject}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
