import bcrypt from 'bcryptjs';
import db from '../database/models/index.cjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const { User } = db;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const provincias = [
    'Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'
];

const userController = {
    register: (req, res) => {
        res.render('register', {  title: 'Registro', stylesheet: 'register.css', provincias })
    },

    proccesRegister: async (req, res) => {
        const { apellido, nombre, email, password, telefono, provincia } = req.body;
        try {
            const newUser = await User.create({
                apellido,
                nombre,
                email,
                password: bcrypt.hashSync(password, 10),
                telefono,
                provincia
            });
        } catch (err) {
            console.error(err);
        }
        return res.redirect('/user/login');
    },

    login: (req, res) => {
        res.render('login', { title: 'Iniciar Sesión', stylesheet: 'login.css' });
    },

    processLogin: async (req, res) => {
        const { email, password } = req.body;

        
        const user = await User.findOne({
            where: { 
                email
            },
            attributes: [
                'id',
                'dni',
                'apellido',
                'nombre',
                'email',
                'password',
                'telefono',
                'provincia',
                'imagen'
            ]
        });
      
        if (!user) {
            return res.render('login', { 
                title: 'Iniciar Sesión', 
                stylesheet: 'login.css',
                error: 'Credenciales inválidas',
                old: req.body
            });
        }

        const contraseñaValida = bcrypt.compareSync(password, user.password);
        if (!contraseñaValida) {
            return res.render('login', { 
                title: 'Iniciar Sesión', 
                stylesheet: 'login.css',
                error: 'Credenciales inválidas',
                old: req.body
            });
        };

        const roles = await user.getRoles({ attributes: ['nombre'] });
        const nombreRoles = roles.map(role => role.nombre);

        const userData = user.get({ plain: true });
        delete userData.password;
        userData.roles = nombreRoles;
        
        req.session.user = userData        
        
        return res.redirect('/');
    },

    logout: (req, res) => {
        req.session.destroy();

        res.redirect('/');
    },

    profile: (req, res) => {
        res.render('profile', { title: 'Mi Perfil', stylesheet: 'profile.css', user: req.session.user });
    },

    managment: (req, res) => {
        res.render('managment', { title: 'Gestión de Propiedades', stylesheet: 'managment.css' })
    },

    edit: (req, res) => {
        res.render('editprofile', { title: 'Editar Perfil', stylesheet: 'edit_profile.css', user: req.session.user, provincias });
    },

    update: async (req, res) => {
        const userId = req.session.user.id;
        if (!userId) return res.redirect('/user/login');

        const user = await User.findByPk(userId);
        const b = req.body;

        if (req.file) {
            const nombreArchivo = req.file.filename;
            if (!nombreArchivo) return res.redirect("/users/edit");
            const avatarAnterior = user.imagen;
            user.imagen = nombreArchivo;
            if (!(avatarAnterior === 'default.png')){
                try {
                    fs.unlinkSync(
                        path.join(__dirname, "../../public/img/users", avatarAnterior)
                    );
                } catch (error) {
                    console.log("Error:", error);
                }
            }
        }

        user.apellido = b.apellido;
        user.nombre = b.nombre;
        user.telefono = b.telefono;
        user.provincia = b.provincia;
        await user.save();

        const userData = await user.get({ plain: true });
        delete userData.password;

        req.session.user = {...req.session.user, ...userData};

        return res.redirect('/user/profile');
    },

    forgot_pass: (req, res) => {
        res.render('forgotPass', { title: 'Olvidé mi contraseña', stylesheet: 'forgot_pass.css' });
    },

    delete: async (req, res) => {
        const userId = req.session.user.id;
        const userDeleted = await User.findByPk(userId);

        if (userDeleted) {
            userDeleted.destroy();
            req.session.destroy();
        }

        return res.redirect('/');
    }
};

export default userController;