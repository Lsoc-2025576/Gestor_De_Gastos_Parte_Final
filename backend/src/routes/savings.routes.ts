import { Router } from 'express';
import { SavingsController } from '../controllers/savings.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.use(authenticateToken);

router.get('/', SavingsController.getAll);
router.post('/', SavingsController.create);

export default router;