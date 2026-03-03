import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { useTranslation } from 'react-i18next';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Antes era (title: string) => void
  onAdd: (task: { title: string; status: 'todo' | 'in-progress' | 'done' }) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const { t } = useTranslation();

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
        <h3>{t('tasks.new_task')}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('tasks.placeholder_title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>{t('common.cancel')}</button>
            <button type="submit" className={styles.submitBtn}>{t('tasks.create_task')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;