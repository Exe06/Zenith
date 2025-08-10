import { Router } from 'express';

const router = Router();

// Registro
router.get('/register', (req, res) => {
  res.render('register', {  title: 'Registro', stylesheet: '/css/register.css' });
});

// Inicio de Sesión
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión', stylesheet: '/css/login.css' });
});

// Olvidé mi contraseña
router.get('/forgot_pass', (req, res) => {
  res.render('forgot_pass', { title: 'Olvidé mi contraseña', stylesheet: '/css/forgot_pass.css' });
});

export default router;