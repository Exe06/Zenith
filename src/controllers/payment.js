import { MercadoPagoConfig, Preference } from 'mercadopago';
import db from '../database/models/index.cjs';
const { Payment, Contract, User, Property } = db;

const client = new MercadoPagoConfig({
  access_token: process.env.MP_ACCESS_TOKEN 
});

function calcularMontoTotal(payment) {
  let montoTotal = parseFloat(payment.amount); // Asegurarse de que es un número

  if (!payment.paid_at) {
    const hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(payment.due_date); 
    vencimiento.setHours(0, 0, 0, 0);
    
    if (hoy > vencimiento) { // Está atrasado
      const diasDeMora = (hoy - vencimiento) / (1000 * 60 * 60 * 24);
      const tasaDiaria = parseFloat(payment.contract.interest_rate || 0) / 100;
      
      if (tasaDiaria > 0) {
        const mora = montoTotal * tasaDiaria * diasDeMora;
        montoTotal = montoTotal + mora;
      }
    }
  }
  // Devolvemos un número redondeado a 2 decimales
  return parseFloat(montoTotal.toFixed(2)); 
}

const paymentController = {
  initiatePayment: async (req, res) => {
    try {
      const paymentId = req.params.id;
      const userId = req.session.user.id; // ID del Inquilino

      // 1. Buscar el pago y verificar que pertenezca al usuario
      const payment = await Payment.findByPk(paymentId, {
        include: [{
          model: Contract,
          as: 'contract',
          where: { tenant_id: userId }, // Seguridad: solo paga sus cuotas
          include: [
            { model: Property, as: 'property', attributes: ['titulo'] },
            { model: User, as: 'owner', attributes: ['nombre', 'apellido'] }
          ]
        }]
      });

      if (!payment || payment.paid_at) {
        return res.status(404).send('Pago no encontrado o ya realizado.');
      }

      // 2. Calcular el monto final (CON MORA) en el backend
      const amountToPay = calcularMontoTotal(payment);

      // 3. Crear la preferencia de pago
      const preferenceBody = {
        items: [
          {
            title: `Alquiler: ${payment.contract.property.titulo}`,
            description: `Cuota ${payment.description || ''} (Vencimiento: ${new Date(payment.due_date).toLocaleDateString()})`,
            unit_price: amountToPay,
            quantity: 1,
            currency_id: 'ARS'
          }
        ],
        back_urls: {
          success: `http://localhost:3000/payments/success`, // Ruta a la que vuelve si paga
          failure: `http://localhost:3000/payments/failure`, // Ruta si falla
          pending: `http://localhost:3000/payments/pending`  // Ruta si queda pendiente (ej. RapiPago)
        },
        auto_return: 'approved', // Solo vuelve automáticamente si es aprobado
        
        // Guardamos el ID de NUESTRO pago
        external_reference: payment.id.toString(), 
        
        // URL a la que Mercado Pago nos avisará (Webhook)
        notification_url: `https://e2b9d2b9ce60.ngrok-free.app/payments/webhook` 
      };

      const preference = new Preference(client)
      const response = await preference.create({ body: preferenceBody });
      
      return res.redirect(response.init_point);

    } catch (error) {
      console.error('Error al iniciar el pago:', error);
      res.status(500).send('Error al procesar el pago.');
    }
  },
  handleWebhook: async (req, res) => {
    const paymentInfo = req.body;

    try {
      // Solo nos interesan las notificaciones de tipo 'payment'
      if (paymentInfo.type === 'payment') {
        const paymentId = paymentInfo.data.id;
        
        const mpPaymentService = new MPPayment(client);
        const mpPayment = await mpPaymentService.get({ id: paymentId });

        if (!mpPayment) {
          return res.status(404).send('Pago no encontrado en MP');
        }

        const { status, external_reference, payment_method_id } = mpPayment;

        // 2. Si el pago fue aprobado
        if (status === 'approved') {
          const ourPaymentId = external_reference; // El ID de nuestra tabla

          // 3. Actualizar nuestra base de datos
          await Payment.update(
            {
              paid_date: new Date(), // Marcar como pagado
              method: payment_method_id // Guardar el método (ej: 'visa', 'rapipago')
            },
            {
              where: { id: ourPaymentId, paid_date: null } // Seguridad: solo actualiza si no estaba pago
            }
          );
        }
      }
      // Avisarle a Mercado Pago que recibimos la info
      res.status(200).send('Webhook received');

    } catch (error) {
      console.error('Error en webhook de Mercado Pago:', error);
      res.status(500).send('Error procesando webhook');
    }
  }
};

export default paymentController;