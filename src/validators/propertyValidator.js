import { body } from 'express-validator';

const ID_TEMPORAL = '2';
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; //5MB

export const validateProperty = [
  body('property_type')
    .notEmpty().withMessage('Debe seleccionar un tipo de propiedad.').bail(),
  body('operation_type')
    .notEmpty().withMessage('Debe seleccionar un tipo de operación.').bail(),
  body('garantia')
    .if(body('operation_type').not().equals(ID_TEMPORAL))
    .notEmpty().withMessage('Debe seleccionar al menos una garantía.').bail(),
  body('title')
    .notEmpty().withMessage('El título es obligatorio.')
    .isLength({ min: 5, max: 80 }).withMessage('El título debe tener entre 5 y 100 caracteres.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('descripcion')
    .notEmpty().withMessage('La descripción es obligatoria.').bail()
    .isLength({ min: 20, max: 500 }).withMessage('La descripción es muy corta.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('direccion')
    .notEmpty().withMessage('La dirección es obligatoria.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('ciudad')
    .notEmpty().withMessage('La ciudad es obligatoria.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('provincia')
    .notEmpty().withMessage('La provincia es obligatoria.'),
  body('barrio')
    .optional()
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('areaTotal')
    .notEmpty().withMessage('El área total es obligatoria.').bail()
    .isInt({ min: 10 }).withMessage('El área total debe ser un número positivo.'),
  body('areaCubierta')
    .notEmpty().withMessage('El área cubierta es obligatoria.').bail()
    .isInt({ min: 10 }).withMessage('El área cubierta debe ser un número.')
    .custom((value, { req }) => {
      if (parseInt(value) > parseInt(req.body.areaTotal)) {
        throw new Error('El área cubierta no puede ser mayor al área total.');
      }
      return true;
    }),
  body('pisos')
    .notEmpty().withMessage('Debe indicar el número de pisos.').bail()
    .isInt({ min: 0 }).withMessage('El número de pisos debe ser 0 o más.'),
  body('ambientes')
    .notEmpty().withMessage('Debe indicar el número de ambientes.').bail()
    .isInt({ min: 1 }).withMessage('Debe tener al menos 1 ambiente.'),
  body('habitaciones')
    .notEmpty().withMessage('Debe indicar el número de habitaciones.').bail()
    .isInt({ min: 0 }).withMessage('El número de habitaciones debe ser 0 o más.'),
  body('banios')
    .notEmpty().withMessage('Debe indicar el número de baños.')
    .isInt({ min: 1 }).withMessage('Debe tener al menos 1 baño.'),
  body('montoBase')
    .if(body('operation_type').not().equals(ID_TEMPORAL))
    .notEmpty().withMessage('El monto base es obligatorio.').bail()
    .isDecimal().withMessage('El monto base debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El monto base no puede ser negativo.'),
  body('deposito')
    .if(body('operation_type').not().equals(ID_TEMPORAL)) 
    .notEmpty().withMessage('El depósito es obligatorio.').bail()
    .isDecimal().withMessage('El depósito debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El depósito no puede ser negativo.'),
  body('dailyPrice')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El precio diario es obligatorio.').bail()
    .isDecimal().withMessage('El precio diario debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El precio diario no puede ser negativo.'),
  body('weeklyDiscount')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El descuento semanal es obligatorio.').bail()
    .isInt({ min: 0, max: 15 }).withMessage('El descuento debe ser un porcentaje (0-100).'),
  body('monthlyDiscount')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El descuento mensual es obligatorio.').bail()
    .isInt({ min: 0, max: 40 }).withMessage('El descuento debe ser un porcentaje (0-100).'),
  body('servicios')
    .custom((value) => {
      if (!value) {
        throw new Error('Debe seleccionar al menos un servicio.');
      }
      if (Array.isArray(value)) {
        const filteredServices = value.filter(Boolean);
        
        if (filteredServices.length === 0) {
          throw new Error('Debe seleccionar al menos un servicio.');
        }
      }
      return true;
    }),
  body('images')
    .custom((value, { req }) => {
      
      const files = req.files?.images;

      if (!files || files.length === 0) {
        throw new Error('Debe subir al menos una imagen.');
      }
      if (files.length > 10) {
        throw new Error(`No puede subir más de 10 imágenes.`);
      }
      for (const file of files) {
        if (!allowedImageTypes.includes(file.mimetype)) {
          throw new Error(`Archivo no válido: "${file.originalname}". Solo se permiten JPG, PNG o WEBP.`);
        }
        
        if (file.size > maxFileSize) {
          throw new Error(`Archivo muy grande: "${file.originalname}". El máximo es 5MB.`);
        }
      }

      return true;
    }),
  body('escritura')
    .custom((value, { req }) => {
      if (!req.files || !req.files.escritura || !req.files.escritura[0]) {
        throw new Error('Debe adjuntar el archivo de la escritura.');
      }
      const file = req.files.escritura[0];
      if (file.mimetype !== 'application/pdf') {
        throw new Error('La escritura debe ser un archivo PDF.');
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande (máximo 5MB).');
      }
      return true;
    }),
];

export const validateEditProperty = [
  body('property_type')
    .notEmpty().withMessage('Debe seleccionar un tipo de propiedad.').bail(),
  body('operation_type')
    .notEmpty().withMessage('Debe seleccionar un tipo de operación.').bail(),
  body('garantia')
    .if(body('operation_type').not().equals(ID_TEMPORAL))
    .notEmpty().withMessage('Debe seleccionar al menos una garantía.').bail(),
  body('title')
    .notEmpty().withMessage('El título es obligatorio.')
    .isLength({ min: 5, max: 80 }).withMessage('El título debe tener entre 5 y 100 caracteres.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('descripcion')
    .notEmpty().withMessage('La descripción es obligatoria.').bail()
    .isLength({ min: 20, max: 500 }).withMessage('La descripción es muy corta.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('direccion')
    .notEmpty().withMessage('La dirección es obligatoria.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('ciudad')
    .notEmpty().withMessage('La ciudad es obligatoria.')
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('provincia')
    .notEmpty().withMessage('La provincia es obligatoria.'),
  body('barrio')
    .optional()
    .trim()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/).withMessage('El título debe comenzar con una letra.'),
  body('areaTotal')
    .notEmpty().withMessage('El área total es obligatoria.').bail()
    .isInt({ min: 10 }).withMessage('El área total debe ser un número positivo.'),
  body('areaCubierta')
    .notEmpty().withMessage('El área cubierta es obligatoria.').bail()
    .isInt({ min: 10 }).withMessage('El área cubierta debe ser un número.')
    .custom((value, { req }) => {
      if (parseInt(value) > parseInt(req.body.areaTotal)) {
        throw new Error('El área cubierta no puede ser mayor al área total.');
      }
      return true;
    }),
  body('pisos')
    .notEmpty().withMessage('Debe indicar el número de pisos.').bail()
    .isInt({ min: 0 }).withMessage('El número de pisos debe ser 0 o más.'),
  body('ambientes')
    .notEmpty().withMessage('Debe indicar el número de ambientes.').bail()
    .isInt({ min: 1 }).withMessage('Debe tener al menos 1 ambiente.'),
  body('habitaciones')
    .notEmpty().withMessage('Debe indicar el número de habitaciones.').bail()
    .isInt({ min: 0 }).withMessage('El número de habitaciones debe ser 0 o más.'),
  body('banios')
    .notEmpty().withMessage('Debe indicar el número de baños.')
    .isInt({ min: 1 }).withMessage('Debe tener al menos 1 baño.'),
  body('montoBase')
    .if(body('operation_type').not().equals(ID_TEMPORAL))
    .notEmpty().withMessage('El monto base es obligatorio.').bail()
    .isDecimal().withMessage('El monto base debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El monto base no puede ser negativo.'),
  body('deposito')
    .if(body('operation_type').not().equals(ID_TEMPORAL)) 
    .notEmpty().withMessage('El depósito es obligatorio.').bail()
    .isDecimal().withMessage('El depósito debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El depósito no puede ser negativo.'),
  body('dailyPrice')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El precio diario es obligatorio.').bail()
    .isDecimal().withMessage('El precio diario debe ser un número decimal.')
    .isFloat({ min: 0.0 }).withMessage('El precio diario no puede ser negativo.'),
  body('weeklyDiscount')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El descuento semanal es obligatorio.').bail()
    .isInt({ min: 0, max: 15 }).withMessage('El descuento debe ser un porcentaje (0-100).'),
  body('monthlyDiscount')
    .if(body('operation_type').equals(ID_TEMPORAL))
    .notEmpty().withMessage('El descuento mensual es obligatorio.').bail()
    .isInt({ min: 0, max: 40 }).withMessage('El descuento debe ser un porcentaje (0-100).'),
  body('servicios')
    .custom((value) => {
      if (!value) {
        throw new Error('Debe seleccionar al menos un servicio.');
      }
      if (Array.isArray(value)) {
        const filteredServices = value.filter(Boolean);
        
        if (filteredServices.length === 0) {
          throw new Error('Debe seleccionar al menos un servicio.');
        }
      }
      return true;
    })
];