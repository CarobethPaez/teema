import React, { useState } from 'react';
import styles from './Dashboard.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
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