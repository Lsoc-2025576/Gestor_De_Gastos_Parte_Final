import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

/**
 * Rutas de Autenticacion
 * Base: /api/auth
 */

// POST /api/auth/register -> Crea un usuario nuevo[cite: 7]
router.post('/register', AuthController.register);

// POST /api/auth/login -> Inicia sesion[cite: 7]
router.post('/login', AuthController.login);

// POST /api/auth/google -> Inicia sesion con Google
router.post('/google', AuthController.googleLogin);

// POST /api/auth/logout -> Cierra sesion (borra cookie)[cite: 7]
router.post('/logout', AuthController.logout);

// GET /api/auth/me -> Devuelve el usuario autenticado (requiere token)[cite: 7]
router.get('/me', authenticateToken, AuthController.me);

export default router;