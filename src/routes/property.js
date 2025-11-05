import { Router } from 'express';
import propertyController from '../controllers/property.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireOwner from '../middlewares/requireOwner.js';
import { uploadPropertyFiles } from '../middlewares/multerProperty.js';
import persistFilters from '../middlewares/persistFilters.js'
import { validateProperty, validateEditProperty} from '../validators/propertyValidator.js';
import { validateContract } from '../validators/contractValidator.js';

const router = Router();
router.use(persistFilters)

// Mostrar todos los inmuebles
router.get('/search', propertyController.search);

// Crear un inmueble
router.get('/create', requireAuth, requireOwner, propertyController.create);
router.post('/create', requireAuth, requireOwner, uploadPropertyFiles, validateProperty, propertyController.ProcessCreate);

// Crear contrato
router.get('/create-contract', requireAuth, requireOwner, propertyController.createContract);
router.post('/create-contract', requireAuth, requireOwner, validateContract, propertyController.processCreateContract);

router.get('/contracts/:id', requireAuth, requireOwner, propertyController.contractDetail)

// Editar un inmueble
router.get('/edit/:id', requireAuth, requireOwner, propertyController.edit);
router.put('/:id', requireAuth, requireOwner, uploadPropertyFiles, validateEditProperty, propertyController.update);

// Detalle de un inmueble
router.get('/:id', propertyController.detail);

// Eliminar un inmueble
router.delete('/:id', requireAuth, requireOwner, propertyController.delete);

export default router;