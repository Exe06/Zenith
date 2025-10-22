import { Router } from 'express';
import indexController from '../controllers/index.js';
import requireAuth from '../middlewares/requireAuth.js';

const router = Router();

// Main
router.get('/', indexController.index);

// Admin
router.get('/admin', requireAuth, indexController.admin);

export default router;