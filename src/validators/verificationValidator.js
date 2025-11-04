import { body } from 'express-validator';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateVerification = [

  body('dni_front')
    .custom((value, { req }) => {
      if (!req.files || !req.files.dni_front || !req.files.dni_front[0]) {
        throw new Error('Debe subir una foto del frente de su DNI.');
      }
      
      const file = req.files.dni_front[0];

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Formato no válido. Solo se permiten JPG, PNG o WEBP.`);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`El archivo es demasiado grande (máximo ${MAX_FILE_SIZE_MB}MB).`);
      }
      
      return true;
    }),

  body('dni_back')
    .custom((value, { req }) => {
      if (!req.files || !req.files.dni_back || !req.files.dni_back[0]) {
        throw new Error('Debe subir una foto del dorso de su DNI.');
      }
      
      const file = req.files.dni_back[0];

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Formato no válido. Solo se permiten JPG, PNG o WEBP.`);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`El archivo es demasiado grande (máximo ${MAX_FILE_SIZE_MB}MB).`);
      }
      
      return true;
    }),

  body('bank_account_type')
    .notEmpty().withMessage('Debe seleccionar un tipo de cuenta (CBU o CVU).').bail()
    .isIn(['cbu', 'cvu']).withMessage('El tipo de cuenta seleccionado no es válido.'),

  body('bank_account_number')
    .notEmpty().withMessage('El número de CBU/CVU es obligatorio.').bail()
    .trim()
    .isNumeric().withMessage('El CBU/CVU solo debe contener números.')
    .isLength({ min: 22, max: 22 }).withMessage('El CBU/CVU debe tener exactamente 22 dígitos.'),

  body('bank_account_alias')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El alias debe tener entre 3 y 50 caracteres.')
];