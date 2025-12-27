import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import type { Project } from '../services/projectService'; // Se agrega 'type' para corregir ts(1484)
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/Dashboard/TaskModal'; // Ruta simplificada
import styles from '../components/Dashboard/Dashboard.module.css'; // Ruta simplificada

// 1. Definimos la interfaz que faltaba
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados para Proyectos (lo que ya tenías)
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para Tareas (lo nuevo)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Configurar Docker', status: 'completed' },
    { id: '2', title: 'Sincronizar Prisma', status: 'completed' }
  ]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status: 'pending'
    };
    setTasks([newTask, ...tasks]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Mi Task Manager</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            + Nueva Tarea
          </button>
          <button onClick={logout} className={styles.cancelBtn}>Salir</button>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}><h3>Total</h3><p>{stats.total}</p></div>
        <div className={`${styles.statCard} ${styles.pending}`}><h3>Pendientes</h3><p>{stats.pending}</p></div>
        <div className={`${styles.statCard} ${styles.completed}`}><h3>Completadas</h3><p>{stats.completed}</p></div>
      </section>

      <main className={styles.mainContent}>
        <h2>Actividad Reciente</h2>
        <ul className={styles.taskList}>
          {tasks.map(task => (
            <li key={task.id} className={styles.taskItem}>
              <span>{task.title}</span>
              <span className={styles.statusBadge}>{task.status}</span>
            </li>
          ))}
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