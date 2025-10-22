import { body } from 'express-validator';
import db from '../database/models/index.cjs';
const { User } = db;


export const validateLogin = [
  body('email')
    .notEmpty().withMessage('Debe ingresar un email.').bail()
    .isEmail().withMessage('Debe ingresar un email valido.'),
  body('password')
    .notEmpty().withMessage('Debe ingresar la contraseña.')
];

export const validateUser = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('Debe ingresar su nombre.').bail()
        .isAlpha('es-ES', { ignore: ' ' }).withMessage('No debe ingresar numeros.').bail()
        .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 letras."),
    body('apellido')
        .trim()
        .notEmpty().withMessage('Debe ingresar su apellido.').bail()
        .isAlpha('es-ES', { ignore: ' ' }).withMessage('No debe ingresar numeros.')
        .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 letras."),
    body('dni')
        .trim()
        .notEmpty().withMessage('Debe ingresar su DNI.').bail()
        .matches(/^\d{8}$/).withMessage('Ingrese un DNI valido.'),
    body('email')
        .notEmpty().withMessage('Debe ingresar su email.').bail()
        .isEmail().withMessage('Debe ingresar un email valido.')
        .custom(async (value) => {
            const userExist = await User.findOne({
                where: {
                    email: value
                }
            });
            if (userExist) {
                throw new Error('El email ingresado ya está registrado.')
            };

            return true;
        }),
    body('telefono')
        .trim()
        .optional({ checkFalsy: true, nullable: true })
        .matches(/^\d{10}$/).withMessage('Ingrese un teléfono válido.'),
    body('provincia')
        .notEmpty().withMessage('Debe seleccionar una provincia.').bail()
];

export const validateUpdate = [
    body('first_name')
        .trim()
        .notEmpty().withMessage('Debe ingresar su Nombre.').bail()
        .isAlpha('es-ES', { ignore: ' ' }).withMessage('No debe ingresar numeros').bail()
        .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 letras."),
    body('last_name')
        .trim()
        .notEmpty().withMessage('Debe ingresar su Apellido.').bail()
        .isAlpha('es-ES', { ignore: ' ' }).withMessage('No debe ingresar numeros')
        .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 letras."),
    body('address')
        .notEmpty().withMessage('Debe ingresar su domicilio.').bail()
        .isString().withMessage('No debe ingresar numeros'),
    body('email')
        .notEmpty().withMessage('Debe ingresar el email').bail()
        .isEmail().withMessage('Debe ingresar un email valido'),
    body('avatar')
        .custom((value, { req }) => {
            if (req.file === undefined)
                return true;
            if (
                req.file.mimetype === 'image/jpeg' ||
                req.file.mimetype === 'image/png' ||
                req.file.mimetype === 'image/jpg'
            ) {
                return true;
            }
            else {

                throw new Error('El archivo debe ser una imagen JPEG, PNG o JPG.');
            }
        })
];

export const validatePassword = [
    body('password')
        .notEmpty().withMessage('Debe ingresar una contraseña.')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            returnScore: false
        })
        .withMessage('La contraseña no cumple con los requisitos de seguridad.')
]