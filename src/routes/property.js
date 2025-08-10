import { Router } from 'express';

const router = Router();

// Mostrar todos los inmuebles
router.get('/', (req, res) => {
  res.render('index', { title: 'Zenit Alquileres', stylesheet: '/css/styles.css' });
});

// Buscar inmuebles
router.get('/search', (req, res) => {
    res.render('index', { title: 'Detalle de Inmueble', stylesheet: '/css/styles.css' });
});

// Detalle de un inmueble
router.get('/:id', (req, res) => {
    res.render('index', { title: 'Crear Inmobiliaria', stylesheet: '/css/styles.css' });
});

// Crear un inmueble
router.get('/create', (req, res) => {
  res.render('index', { title: 'Crear Inmobiliaria', stylesheet: '/css/styles.css' });
});

// Editar un inmueble
router.get('/edit/:id', (req, res) => {
  res.render('index', { title: 'Editar Inmobiliaria', stylesheet: '/css/styles.css' });
});

router.patch('/:id', (req, res) => {
  res.redirect('/property');
});

// Eliminar un inmueble
router.delete('/:id', (req, res) => {
  res.redirect('/property');
});


export default router;