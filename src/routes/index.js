import { Router } from 'express';
import indexController from '../controllers/index.js';
import isAdmin from '../middlewares/requireAdmin.js';

const router = Router();

// Main
router.get('/', indexController.index);

// Admin
router.get('/admin', isAdmin, indexController.admin);

router.get('/admin/get-file/:filename', isAdmin, indexController.getFile);
router.get('/admin/get-deed/:filename', isAdmin, indexController.getDeed);

router.get('/admin/user/review/:id', isAdmin, indexController.userReview);

// RUTA PARA APROBAR
router.put('/admin/user/approve/:id', isAdmin, indexController.approveUser);

// RUTA PARA RECHAZAR
router.put('/admin/user/reject/:id', isAdmin, indexController.rejectUser);

router.delete('/admin/user/delete/:id', isAdmin, indexController.deleteUser);

router.get('/admin/property/review/:id', isAdmin, indexController.propertyReview);

router.put('/admin/property/approve/:id', isAdmin, indexController.approveProperty);

router.put('/admin/property/reject/:id', isAdmin, indexController.rejectProperty);

export default router;