import { Router } from 'express';
import userController from '../controllers/user.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireGuest from '../middlewares/requireGuest.js';
import upload from '../middlewares/multerUser.js';
import { validateUser, validatePassword, validateLogin } from '../validators/userValidator.js' 

const router = Router();

// Registro
router.get('/register', requireGuest, userController.register);
router.post('/register', requireGuest, validateUser, validatePassword, userController.proccesRegister);

// Inicio de Sesión
router.get('/login', requireGuest, userController.login);
router.post('/login', requireGuest, validateLogin, userController.processLogin);

router.get('/logout', requireAuth, userController.logout);

// Olvidé mi contraseña
router.get('/forgot_pass', requireGuest, userController.forgot_pass);

// Panel de Gestión de Propiedades
router.get('/managment', requireAuth, userController.managment);

// Perfil de Usuario
router.get('/profile', requireAuth, userController.profile);

router.get('/become_owner', requireAuth, userController.becomeOwner)
router.patch('/become_owner', requireAuth, userController.updateOwner);

// Editar Perfil
router.get('/edit/:id', requireAuth, userController.edit);
router.patch('/:id', requireAuth, upload.single('avatar'), userController.update);

// Borrar Usuario
router.delete('/:id', requireAuth, userController.delete);

export default router;