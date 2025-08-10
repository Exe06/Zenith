import { Router } from 'express';

const router = Router();

// Main
router.get('/', (req, res) => {
  res.render('index', { title: 'Zenit Alquileres', stylesheet: '/css/styles.css' });
});

export default router;