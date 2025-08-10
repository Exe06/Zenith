import { Router } from 'express';

const router = Router();

// Registro
router.get('/register', (req, res) => {
  res.render('register', {  title: 'Registro', stylesheet: '/css/register.css' });
});

router.post('/register', (req, res) => {
  res.redirect('/login'); // Redirigir al usuario a la página de inicio de sesión después del registro
});

// Inicio de Sesión
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión', stylesheet: '/css/login.css' });
});

router.post('/login', (req, res) => {
  res.redirect('/profile'); // Redirigir al usuario a su perfil después de iniciar sesión
});

// Perfil de Usuario
router.get('/:id', (req, res) => {
  res.render('profile', { title: 'Mi Perfil', stylesheet: '/css/profile.css' });
});

// Editar Perfil
router.get('/edit/:id', (req, res) => {
  res.render('edit', { title: 'Editar Usuario', stylesheet: '/css/register.css' });
});

router.patch('/:id', (req, res) => {
  res.redirect('/profile');
});

// Olvidé mi contraseña
router.get('/forgot_pass', (req, res) => {
  res.render('forgot_pass', { title: 'Olvidé mi contraseña', stylesheet: '/css/forgot_pass.css' });
});

// Borrar Usuario
router.delete('/:id', (req, res) => {
  res.redirect('/');
});

export default router;