import db from '../database/models/index.cjs';
const { User, Role } = db;

const indexController = {
    index: (req, res) => {
        res.render('index', { title: 'Zenit Alquileres', stylesheet: 'styles.css' });
    },
    admin: (req, res) => {
        res.render('admin', { title: 'Panel de Administración', stylesheet: 'admin.css' });
    }
};

export default indexController;