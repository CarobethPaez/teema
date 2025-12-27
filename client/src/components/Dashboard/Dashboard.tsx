import React, { useState } from 'react'; // Corrige "Cannot find name useState"
import styles from './Dashboard.module.css'; // Corrige "Cannot find name styles"

// Corrige "Cannot find name Task"
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
}

const Dashboard: React.FC = () => {
  // Ahora usamos stats para que no salga "declared but never read"
  const stats = { total: 3, pending: 1, completed: 2 };

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Configurar Docker', status: 'completed' },
    { id: '2', title: 'Sincronizar Prisma', status: 'completed' },
    { id: '3', title: 'Diseñar Dashboard', status: 'pending' }
  ]);

  const handleAddTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'Nueva tarea de prueba',
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mi Task Manager</h1>
        <button className={styles.addButton} onClick={handleAddTask}>
          + Nueva Tarea
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total</h3>
          <p>{stats.total}</p>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <h3>Pendientes</h3>
          <p>{stats.pending}</p>
        </div>
        <div className={`${styles.statCard} ${styles.completed}`}>
          <h3>Completadas</h3>
          <p>{stats.completed}</p>
        </div>
      </section>

      <main className={styles.mainContent}>
        <h2>Actividad Reciente</h2>
        <ul className={styles.taskList}>
          {tasks.map((task: Task) => ( // Agregamos :Task aquí para corregir el error de "any"
            <li key={task.id} className={styles.taskItem}>
              <span>{task.title}</span>
              <span className={styles.statusBadge}>{task.status}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Dashboard; // Corrige "Dashboard is declared but never read"