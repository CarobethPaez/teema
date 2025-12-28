import { Router } from 'express';
import { createComment, deleteComment, getTaskComments } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/', createComment);
router.delete('/:id', deleteComment);
router.get('/task/:taskId', getTaskComments);

export default router;
