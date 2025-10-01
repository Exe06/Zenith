import { Router } from 'express';
import propertyController from '../controllers/property.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireOwner from '../middlewares/requireOwner.js';
import upload from '../middlewares/multerProperty.js';
import persistFilters from '../middlewares/persistFilters.js'

const router = Router();
router.use(persistFilters)

// Mostrar todos los inmuebles
router.get('/search', propertyController.search);

// Crear un inmueble
router.get('/create', requireAuth, propertyController.create);
router.post('/create',  upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'escritura', maxCount: 1 }
]), propertyController.ProcessCreate);

// Crear contrato
router.get('/create-contract', requireAuth, requireOwner, propertyController.createContract);

// Editar un inmueble
router.get('/edit/:id', requireAuth, requireOwner, propertyController.edit);
router.patch('/:id', requireAuth, requireOwner, propertyController.update);

// Detalle de un inmueble
router.get('/:id', propertyController.detail);

// Eliminar un inmueble
router.delete('/:id', requireAuth, requireOwner, propertyController.delete);

export default router;