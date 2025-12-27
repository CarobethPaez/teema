import React, { useState } from 'react';
import styles from './Dashboard.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Antes era (title: string) => void
  onAdd: (task: { title: string; status: 'todo' | 'in-progress' | 'done' }) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (title.trim()) {
    // Agregamos el objeto con el estado 'todo'
    onAdd({ 
      title: title.trim(), 
      status: 'todo' 
    });
    setTitle('');
    onClose();
  }
};

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Nueva Tarea</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="¿Qué hay que hacer?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>Crear Tarea</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;