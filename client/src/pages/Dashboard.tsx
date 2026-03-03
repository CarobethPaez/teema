import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import type { Project } from '../services/projectService';
import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/Dashboard/TaskModal';
import { useSocket } from '../context/SocketContext';
import styles from '../components/Dashboard/Dashboard.module.css';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isMounted: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getAll();
      if (isMounted) setProjects(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      if (isMounted) setError(t('tasks.error_load'));
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchData(isMounted);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      setProjects(prev => prev.map(p => p.id === newTask.projectId ? { ...p, tasks: [newTask, ...(p.tasks || [])] } : p));
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setProjects(prev => prev.map(p => p.id === updatedTask.projectId ? {
        ...p,
        tasks: (p.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t)
      } : p));
    };

    const handleTaskDeleted = ({ id, projectId }: { id: string; projectId: string }) => {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        tasks: (p.tasks || []).filter(t => t.id !== id)
      } : p));
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

  const tasks = useMemo(() => projects.flatMap(p => p.tasks || []), [projects]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  }), [tasks]);

  const handleAddTask = async (taskData: { title: string; status: 'todo' | 'in-progress' | 'done' }) => {
    if (projects.length === 0) {
      alert(t('tasks.first_project_alert'));
      return;
    }

    try {
      const newTask = await taskService.create({
        ...taskData,
        projectId: projects[0].id
      });
      // UI will likely be updated via socket, but we can manually update projects state for instant feedback
      setProjects(prev => prev.map(p => p.id === newTask.projectId ? {
        ...p,
        tasks: [newTask, ...(p.tasks || []).filter(t => t.id !== newTask.id)]
      } : p));
    } catch (err) {
      console.error('Failed to add task', err);
      alert(t('tasks.error_create'));
    }
  };

  if (isLoading) return <div className={styles.container}><div className={styles.emptyState}>{t('common.loading')}</div></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('common.welcome')}, <strong>{user?.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <LanguageSwitcher />
          <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            {t('dashboard.new_task')}
          </button>
          <button onClick={logout} className={styles.cancelBtn}>{t('common.logout')}</button>
        </div>
      </header>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <section className={styles.statsGrid}>
        <div className={styles.statCard}><h3>{t('dashboard.stats.total')}</h3><p>{stats.total}</p></div>
        <div className={`${styles.statCard} ${styles.pending}`}><h3>{t('dashboard.stats.pending')}</h3><p>{stats.todo}</p></div>
        <div className={`${styles.statCard} ${styles.completed}`}><h3>{t('dashboard.stats.completed')}</h3><p>{stats.done}</p></div>
      </section>

      <main className={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{t('dashboard.my_projects')}</h2>
          <button className={styles.addButton} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => navigate('/projects/new')}>
            {t('dashboard.new_project')}
          </button>
        </div>

        {projects.length > 0 ? (
          <div className={styles.projectGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {projects.map(project => (
              <div key={project.id} className={styles.statCard} style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate(`/projects/${project.id}`)}>
                <h3 style={{ fontSize: '1.2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'normal' }}>{project.description || t('dashboard.project_card.no_description')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <span>{project._count?.tasks || 0} {t('dashboard.project_card.tasks')}</span>
                  <span>{project._count?.members || 0} {t('dashboard.project_card.members')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} style={{ marginBottom: '3rem' }}>
            <p>{t('dashboard.no_projects')}</p>
            <button className={styles.addButton} style={{ marginTop: '1rem' }} onClick={() => navigate('/projects/new')}>
              {t('dashboard.create_first_project')}
            </button>
          </div>
        )}

        <h2>{t('dashboard.recent_activity')}</h2>
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
              <p>{t('dashboard.no_tasks')}</p>
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