import { Router } from 'express';
import paymentController from '../controllers/payment.js'
const router = Router();

router.get('/pay/:id', paymentController.initiatePayment);

router.get('/success', (req, res) => {res.send('Pago Exitoso')});

router.get('/failure', (req, res) => {res.send('Pago Fallido')});

router.get('/pending', (req, res) => {res.send('Pago Pendiente')});

router.post('/webhook', paymentController.handleWebhook);

export default router;