import { Router } from 'express';
import userController from '../controllers/user.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireGuest from '../middlewares/requireGuest.js';

const router = Router();

// Registro
router.get('/register', requireGuest, userController.register);
router.post('/register', requireGuest, userController.proccesRegister);

// Inicio de Sesión
router.get('/login', requireGuest, userController.login);
router.post('/login', requireGuest, userController.processLogin);

// Olvidé mi contraseña
router.get('/forgot_pass', requireGuest, userController.forgot_pass);

// Panel de Gestión de Propiedades
router.get('/managment', requireAuth, userController.managment);

// Perfil de Usuario
router.get('/profile', requireAuth, userController.profile);

// Editar Perfil
router.get('/edit/:id', requireAuth, userController.edit);

router.patch('/:id', requireAuth, userController.update);

// Borrar Usuario
router.delete('/:id', requireAuth, userController.delete);

export default router;