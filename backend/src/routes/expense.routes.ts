import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.get('/', authenticateToken, ExpenseController.getAll);
router.get('/summary', authenticateToken, ExpenseController.getSummary);
router.post('/', authenticateToken, ExpenseController.create);
router.patch('/:id', authenticateToken, ExpenseController.update);
router.delete('/:id', authenticateToken, ExpenseController.delete);

export default router;