import { Router } from 'express';

const router = Router();

// Registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Inicio de Sesión
router.get('/login', (req, res) => {
  res.render('login');
});

export default router;