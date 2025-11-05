import { Router } from 'express';
import userController from '../controllers/user.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireGuest from '../middlewares/requireGuest.js';
import upload from '../middlewares/multerUser.js';
import { uploadDniFiles } from '../middlewares/multerVerification.js';
import { validateUser, validatePassword, validateLogin, validateMessage, validateReply } from '../validators/userValidator.js'
import { validateVerification } from '../validators/verificationValidator.js';

const router = Router();

// Registro
router.get('/register', requireGuest, userController.register);
router.post('/register', requireGuest, validateUser, validatePassword, userController.proccesRegister);

// Inicio de Sesión
router.get('/login', requireGuest, userController.login);
router.post('/login', requireGuest, validateLogin, userController.processLogin);

router.get('/logout', requireAuth, userController.logout);

router.get('/panel', userController.panel);

// Olvidé mi contraseña
router.get('/forgot_pass', requireGuest, userController.forgotPass);

// Panel de Gestión de Propiedades
router.get('/managment', requireAuth, userController.managment);

// Perfil de Usuario
router.get('/profile', requireAuth, userController.profile);

router.get('/verify_account', requireAuth, userController.verifyAccount)
router.post('/verify_account', requireAuth, uploadDniFiles, validateVerification, userController.processVerification);

router.get('/user/verificationPending', requireAuth, userController.verificationPending);

router.post('/messages/start', requireAuth, validateMessage, userController.startConversation);
router.post('/messages/reply', userController.replyToConversation)
router.get('/messages/:id', userController.showConversation)

// Editar Perfil
router.get('/edit/:id', requireAuth, userController.edit);
router.patch('/:id', requireAuth, upload.single('avatar'), userController.update);

// Borrar Usuario
router.delete('/:id', requireAuth, userController.delete);

export default router;