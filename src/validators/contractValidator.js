import { body } from 'express-validator';
import { Op } from 'sequelize';
import db from '../database/models/index.cjs';
const { User } = db;

const TIPO_LARGO_PLAZO = 'Alquiler Largo Plazo';
const TIPO_TEMPORAL = 'Alquiler Temporal';
const MIN_DAYS_LP = 1095;

export const validateContract = [
  body('property_id')
    .notEmpty().withMessage('Debe seleccionar una propiedad.').bail()
    .isInt().withMessage('ID de propiedad inválido.'),

  // 2. ID de Inquilino (Se valida por DNI y se usa el ID oculto)
  body('tenant_dni')
    .trim()
    .notEmpty().withMessage('Debe ingresar el DNI del inquilino.')
    .isNumeric().withMessage('El DNI solo debe contener números.')
    .isLength({ min: 8, max: 8 }).withMessage('Ingrese un DNI valido.')
    .custom(async (value) => {
      const user = await User.findOne({ where: { dni: value } });
      if (!user) {
        throw new Error('No se encontró ningún usuario con ese DNI.');
      }
    }),

  // 3. ID de Garantía (Opcional)
  body('guarantee_id')
    .optional({ checkFalsy: true })
    .isInt().withMessage('ID de garantía inválido.'),

  // --- Fechas ---
  body('start_date')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .isDate().withMessage('Formato de fecha de inicio inválido (dd/mm/aaaa).'),
  
  body('end_date')
    .notEmpty().withMessage('La fecha de fin es obligatoria.')
    .isDate().withMessage('Formato de fecha de fin inválido.')
    .custom((value, { req }) => {
      const start = new Date(req.body.start_date);
      const end = new Date(value);
      if (end <= start) {
        throw new Error('La fecha de fin debe ser posterior a la de inicio.');
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isLargoPlazo = req.body.contract_type === TIPO_LARGO_PLAZO;

      if (isLargoPlazo && diffDays < MIN_DAYS_LP) {
        throw new Error(`La duración mínima para un alquiler a largo plazo es de 3 años (aprox. ${MIN_DAYS_LP} días).`);
      }

      return true;
    }),

  // --- Lógica de Modos (LP vs. Temporal) ---
  
  // 4. Pago Inicial (Monto Base) y Depósito Mensual (Cuota Recurrente)
  body('montoBase') // Pago Inicial (Monto Base)
    .if(body('contract_type').equals(TIPO_LARGO_PLAZO))
    .notEmpty().withMessage('El Pago Inicial es obligatorio.')
    .isDecimal({ min: 0.01 }).withMessage('El Pago Inicial debe ser un monto válido.'),

  body('deposito') // Depósito Mensual (Cuota Recurrente)
    .if(body('contract_type').equals(TIPO_LARGO_PLAZO))
    .notEmpty().withMessage('El Depósito Mensual (cuota) es obligatorio para Largo Plazo.')
    .isDecimal({ min: 0.01 }).withMessage('El Depósito Mensual debe ser un monto válido.'),

  // 5. Valor por Día (Solo Temporal)
  body('dailyPrice')
    .if(body('contract_type').equals(TIPO_TEMPORAL))
    .notEmpty().withMessage('El Valor por día es obligatorio para Temporal.')
    .isDecimal({ min: 0.01 }).withMessage('El Valor por día debe ser un monto válido.'),
    
  // 6. Tasa de Mora (Opcional para ambos, pero numérico)
  body('mora_interest_rate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.0, max: 1.0 }).withMessage('La tasa de mora diaria debe ser un porcentaje válido (máx. 1.0%).'),
  
  body('pay_frequency')
    .if(body('contract_type').equals(TIPO_TEMPORAL))
    .notEmpty().withMessage('La frecuencia de pago es requerida.')
    .isIn(['un_pago', 'diario', 'semanal', 'mensual']).withMessage('Frecuencia de pago no válida.'),
];