import { Router } from 'express';

const router = Router();

// Main
router.get('/', (req, res) => {
  res.render('index', { title: 'Zenit Alquileres', stylesheet: 'styles.css' });
});

// Admin
router.get('/admin', (req, res) => {
  res.render('admin', { title: 'Panel de Administración', stylesheet: 'admin.css' });
});

export default router;