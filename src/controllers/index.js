import db from '../database/models/index.cjs';
const { User, Role } = db;

const indexController = {
    index: (req, res) => {
        res.render('index', { title: 'Zenit Alquileres', stylesheet: 'styles.css' });
    },
    admin: (req, res) => {
        res.render('admin', { title: 'Panel de Administración', stylesheet: 'admin.css' });
    },
    becomeOwner: async (req, res) => {
        const userId = req.session.user.id;
        const user = await User.findByPk(userId)
        const rol = await Role.findOne({ where: { nombre: 'Propietario' } });

        const isOwner = await user.hasRole(rol);
        if (!isOwner) {
            await user.addRole(rol);
        }

        const roles = await user.getRoles({ attributes: ['nombre'] });
        const nombreRoles = roles.map(role => role.nombre);

        const userData = user.get({ plain: true });
        delete userData.password;
        userData.roles = nombreRoles;

        req.session.user = userData

        return res.redirect('/user/managment');
    }
};

export default indexController;