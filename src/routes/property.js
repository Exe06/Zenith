import { Router } from 'express';

const router = Router();

// Mostrar todos los inmuebles
router.get('/', (req, res) => {
  res.render('search', { title: 'Inmuebles', stylesheet: 'search.css' });
});

// Buscar inmuebles
router.get('/search', (req, res) => {
    res.render('Buscar inmuebles');
});

// Crear un inmueble
router.get('/create', (req, res) => {
  res.render('createProperty', { title: 'Crear Propiedad', stylesheet: 'create_property.css' });
});

// Detalle de un inmueble
router.get('/:id', (req, res) => {
    res.render('propertyDetail', { title: 'Detalle de Inmueble', stylesheet: 'property_detail.css' });
});


// Editar un inmueble
router.get('/edit/:id', (req, res) => {
  res.render('editProperty', { title: 'Editar Inmobiliaria', stylesheet: 'create_property.css' });
});

router.patch('/:id', (req, res) => {
  res.redirect('/property');
});

// Eliminar un inmueble
router.delete('/:id', (req, res) => {
  res.redirect('/property');
});

export default router;