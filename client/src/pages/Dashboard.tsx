import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService, Project } from '../services/projectService';
import { taskService, Task } from '../services/taskService';
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/Dashboard/TaskModal';
import { useSocket } from '../context/SocketContext';
import styles from '../components/Dashboard/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(data);
      const allTasks = data.flatMap(p => p.tasks || []);
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Error al cargar datos. Asegúrate de que el servidor esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      setTasks(prev => [newTask, ...prev]);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks(prev => prev.filter(t => t.id !== id));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  }), [tasks]);

  const handleAddTask = async (taskData: { title: string; status: 'todo' | 'in-progress' | 'done' }) => {
    if (projects.length === 0) {
      alert('Por favor, crea un proyecto primero antes de agregar tareas.');
      return;
    }

    try {
      const newTask = await taskService.create({
        ...taskData,
        projectId: projects[0].id
      });
      // La actualización de la UI se manejará vía socket si el servidor emite,
      // o manualmente aquí si queremos feedback instantáneo sin socket.
      // Como ya tenemos el listener, si el servidor emite 'task:created', no necesitamos setearlo aquí.
      // Pero para mayor seguridad en caso de que el socket falle:
      setTasks(prev => {
        if (prev.find(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
    } catch (err) {
      console.error('Failed to add task', err);
      alert('Error al crear la tarea. Intenta de nuevo.');
    }
  };

  if (isLoading) return <div className={styles.container}><div className={styles.emptyState}>Cargando...</div></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Teema Dashboard</h1>
          <p>Bienvenido, <strong>{user?.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            + Nueva Tarea
          </button>
          <button onClick={logout} className={styles.cancelBtn}>Salir</button>
        </div>
      </header>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <section className={styles.statsGrid}>
        <div className={styles.statCard}><h3>Total</h3><p>{stats.total}</p></div>
        <div className={`${styles.statCard} ${styles.pending}`}><h3>Pendientes</h3><p>{stats.todo}</p></div>
        <div className={`${styles.statCard} ${styles.completed}`}><h3>Completadas</h3><p>{stats.done}</p></div>
      </section>

      <main className={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Mis Proyectos</h2>
          <button className={styles.addButton} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => navigate('/projects/new')}>
            + Nuevo Proyecto
          </button>
        </div>

        {projects.length > 0 ? (
          <div className={styles.projectGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {projects.map(project => (
              <div key={project.id} className={styles.statCard} style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate(`/projects/${project.id}`)}>
                <h3 style={{ fontSize: '1.2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'normal' }}>{project.description || 'Sin descripción'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <span>{project._count?.tasks || 0} Tareas</span>
                  <span>{project._count?.members || 0} Miembros</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} style={{ marginBottom: '3rem' }}>
            <p>No tienes proyectos aún.</p>
            <button className={styles.addButton} style={{ marginTop: '1rem' }} onClick={() => navigate('/projects/new')}>
              Crear mi primer proyecto
            </button>
          </div>
        )}

        <h2>Actividad Reciente</h2>
        <ul className={styles.taskList}>
          {tasks.length > 0 ? tasks.slice(0, 5).map(task => (
            <li key={task.id} className={styles.taskItem}>
              <div>
                <span style={{ display: 'block' }}>{task.title}</span>
                <span style={{ fontSize: '0.7rem', color: '#999' }}>Proyecto ID: {task.projectId}</span>
              </div>
              <span className={styles.statusBadge}>{task.status}</span>
            </li>
          )) : (
            <div className={styles.emptyState} style={{ padding: '1.5rem' }}>
              <p>No hay tareas registradas.</p>
            </div>
          )}
        </ul>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
};

export default Dashboard;