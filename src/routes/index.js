import { Router } from 'express';

const router = Router();

// Define your routes here
router.get('/', (req, res) => {
  res.render('index', { title: 'Zenit Alquileres', stylesheet: '/css/styles.css' });
});

export default router;