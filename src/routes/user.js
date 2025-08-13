import { Router } from 'express';

const router = Router();

// Registro
router.get('/register', (req, res) => {
  res.render('register', {  title: 'Registro', stylesheet: 'register.css' });
});

router.post('/register', (req, res) => {
  res.redirect('/login'); // Redirigir al usuario a la página de inicio de sesión después del registro
});

// Inicio de Sesión
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión', stylesheet: 'login.css' });
});

router.post('/login', (req, res) => {
  res.redirect('/profile'); // Redirigir al usuario a su perfil después de iniciar sesión
});

// Olvidé mi contraseña
router.get('/forgot_pass', (req, res) => {
  res.render('forgotPass', { title: 'Olvidé mi contraseña', stylesheet: 'forgot_pass.css' });
});

// Panel de Gestión de Propiedades
router.get('/managment', (req, res) => {
  res.render('managment', { title: 'Gestión de Propiedades', stylesheet: 'managment.css' });
});

// Panel de Administración
router.get('/admin', (req, res) => {
  res.render('admin', { title: 'Panel de Administración', stylesheet: 'admin.css' });
});

// Perfil de Usuario
router.get('/:id', (req, res) => {
  res.render('profile2', { title: 'Mi Perfil', stylesheet: 'profile2.css' });
});

// Editar Perfil
router.get('/edit/:id', (req, res) => {
  res.render('editProfile', { title: 'Editar Perfil', stylesheet: 'edit_profile.css' });
});

router.patch('/:id', (req, res) => {
  res.redirect('/profile');
});


// Borrar Usuario
router.delete('/:id', (req, res) => {
  res.redirect('/');
});

export default router;