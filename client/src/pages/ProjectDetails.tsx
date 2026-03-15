import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { Project } from '../services/projectService';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useSocket } from '../context/SocketContext';
import type { Task } from '../services/taskService';
import { useTranslation } from 'react-i18next';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const { socket } = useSocket();
    const { t } = useTranslation();

    const fetchProject = useCallback(async () => {
        if (!id) return;
        try {
            const data = await projectService.getOne(id);
            setProject(data);
        } catch (err: unknown) {
            console.error('Failed to fetch project', err);
            setError(t('projects.details.loading'));
            setTimeout(() => navigate('/'), 3000);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate, t]);

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

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !project) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const newStatus = destination.droppableId as 'todo' | 'in-progress' | 'done';
        
        // Optimistic UI update
        setProject(prev => {
            if (!prev) return prev;
            
            const updatedTasks = prev.tasks.map(t => {
                if (t.id === draggableId) {
                    return { ...t, status: newStatus };
                }
                return t;
            });
            
            return { ...prev, tasks: updatedTasks };
        });

        try {
            await taskService.update(draggableId, { status: newStatus });
            // onTaskUpdated will also trigger fetchProject usually, but optimistic update handles immediate UI
        } catch (error) {
            console.error('Failed to update task status via drag and drop', error);
            // Revert on error
            fetchProject();
        }
    };

    const columns: Array<{ id: 'todo' | 'in-progress' | 'done', title: string }> = [
        { id: 'todo', title: t('tasks.status.todo') },
        { id: 'in-progress', title: t('tasks.status.in_progress') },
        { id: 'done', title: t('tasks.status.done') }
    ];

    if (isLoading) return <div className="container" style={{ paddingTop: '2rem' }}>{t('projects.details.loading')}</div>;
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
                    &larr; {t('common.back_to_dashboard')}
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
                            {t('tasks.new_task')}
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--border)' }}>{t('projects.details.settings')}</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>{t('tasks.title')}</h3>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                        {columns.map(col => {
                            const columnTasks = (project.tasks || []).filter(t => t.status === col.id);
                            return (
                                <Droppable droppableId={col.id} key={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="card"
                                            style={{
                                                padding: '1rem',
                                                backgroundColor: snapshot.isDraggingOver ? 'var(--surface-hover)' : 'var(--surface)',
                                                borderRadius: 'var(--radius)',
                                                minHeight: '400px',
                                                transition: 'background-color 0.2s ease',
                                                borderTop: `4px solid ${
                                                    col.id === 'todo' ? 'var(--text-secondary)' : 
                                                    col.id === 'in-progress' ? 'var(--primary)' : 'var(--success)'
                                                }`
                                            }}
                                        >
                                            <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {col.title}
                                                <span style={{ 
                                                    fontSize: '0.8rem', 
                                                    backgroundColor: 'var(--background)', 
                                                    padding: '0.1rem 0.5rem', 
                                                    borderRadius: '1rem',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {columnTasks.length}
                                                </span>
                                            </h4>
                                            
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                                                cursor: 'grab'
                                                            }}
                                                        >
                                                            <TaskCard
                                                                task={task}
                                                                onTaskUpdated={fetchProject}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{t('projects.details.team')}</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {project.members?.map(member => (
                            <li key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--background)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{member.name}</span>
                                {member.id === project.ownerId && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>{t('projects.details.owner')}</span>}
                            </li>
                        ))}
                    </ul>
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
