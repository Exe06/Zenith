import db from '../database/models/index.cjs';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
const { User, Property, Role, PropertyImage, OperationType, sequelize, Service, Guarantee, PropertyType } = db;
const PAGE_SIZE = 15;

const indexController = {
  index: (req, res) => {
    res.render('index', { title: 'Zenit Alquileres', stylesheet: 'styles.css' });
  },
  admin: async (req, res) => {
    try {
      // --- 1. CONFIGURACIÓN DE FILTROS GLOBALES (Recarga de página) ---
      const { q, page = 1, tab = 'usuarios', fEstado } = req.query; 
      const currentPage = Math.max(parseInt(page, 10), 1);
      
      // --- 2. CONFIGURACIÓN DE CONSULTAS ---
      let results = { rows: [], count: 0 };
      let totalPages = 0;
      
      if (tab === 'usuarios') {
        const userWhere = { [Op.and]: [] };
        if (q) {
          userWhere[Op.and].push({
            [Op.or]: [
              { nombre: { [Op.like]: `%${q}%` } },
              { apellido: { [Op.like]: `%${q}%` } },
              { email: { [Op.like]: `%${q}%` } },
            ]
          });
        }
          
        if (fEstado) {
          const estadoLower = fEstado.toLowerCase();
          if (estadoLower === 'inactivo') {
            userWhere[Op.and].push({
              deleted_at: { [Op.ne]: null }
            });
          } else if (estadoLower === 'activo' || estadoLower === 'pendiente'){
            // Activo o Pendiente: Filtramos la columna 'estado'
            userWhere[Op.and].push({
              estado: estadoLower, // 'activo' o 'pendiente'
              deleted_at: null // Y que no estén soft-deleted
            });
          }
        }

        // Consultamos Usuarios y sus roles
        results = await User.findAndCountAll({
          where: userWhere,
          attributes: ['id', 'nombre', 'apellido', 'email', 'deleted_at', 'estado'],
          include: [{ model: Role, as: 'roles', attributes: ['nombre'] }],
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          distinct: true,
          paranoid: false
        });

      } else if (tab === 'inmuebles') {
        const propertyWhere = {};
        if (q) {
          propertyWhere[Op.or] = [
            { titulo: { [Op.like]: `%${q}%` } },
            { ciudad: { [Op.like]: `%${q}%` } },
          ];
        }
          
        // Consultamos Inmuebles con datos básicos
        results = await Property.findAndCountAll({
          where: propertyWhere,
          include: [
              { model: OperationType, as: 'operation', attributes: ['nombre'] },
              { model: PropertyImage, as: 'images', attributes: ['filename'], limit: 1 },
          ],
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          distinct: true
        });
      }
      
      totalPages = Math.ceil(results.count / PAGE_SIZE);

      // --- 3. RENDERIZADO ---
      res.render('admin2', {
        title: 'Panel de Administración',
        stylesheet: 'admin.css',
        results: results.rows,
        currentTab: tab,
        query: req.query,
        page: currentPage,
        pages: totalPages
      });

    } catch (err) {
      console.error('Error al cargar el panel de administrador:', err);
      res.status(500).send('Error interno del servidor.');
    }
  },
  getFile: (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'storage', 'dni', filename);

    // Asegurarse de que el archivo existe y es un archivo seguro
    if (fs.existsSync(filePath) && path.dirname(filePath) === path.join(process.cwd(), 'storage', 'dni')) {
      return res.sendFile(filePath);
    }

    res.status(404).send('Archivo no encontrado.');
  },
  getDeed: (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'storage', 'escritura', filename);

    if (fs.existsSync(filePath) && path.dirname(filePath) === path.join(process.cwd(), 'storage', 'escritura')) {
      res.setHeader('Content-Type', 'application/pdf'); // Le dice al navegador que es un PDF
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
      return res.sendFile(filePath);
    }

    res.status(404).send('Archivo no encontrado.');
  },
  userReview: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscamos al usuario, incluyendo sus roles
      const userToReview = await User.findByPk(id, {
        attributes: [
          'id', 'nombre', 'apellido', 'email', 'telefono', 'dni_front', 'dni_back',
          'bank_account_type', 'bank_account_number', 'bank_account_alias',
          'estado', 'deleted_at' // Incluimos el estado actual
        ],
        include: [{ model: Role, as: 'roles', attributes: ['nombre'] }],
        paranoid: false
      });

      if (!userToReview) {
        return res.status(404).send('Usuario no encontrado.');
      }
      
      // Renderizamos la vista de revisión
      res.render('reviewUser', {
        title: `Revisión: ${userToReview.nombre} ${userToReview.apellido}`,
        user: userToReview,
        stylesheet: 'panel.css'
      });

    } catch (error) {
      console.error('Error al cargar la revisión de usuario:', error);
      res.status(500).send('Error interno.');
    }
  },
  approveUser: async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
      const user = await User.findByPk(id);
      const propietarioRole = await Role.findOne({ where: { nombre: 'Propietario' } });

      if (!user || !propietarioRole) {
        throw new Error('Usuario o rol no encontrado.');
      }

      // 1. Actualizar el estado de la cuenta a 'activo' (para fines de visualización)
      await user.update({ estado: 'activo' }, { transaction: t });
      
      // 2. Asignar el rol 'propietario' (la acción clave)
      await user.addRole(propietarioRole, { transaction: t });

      await t.commit();
      return res.redirect('/admin?tab=usuarios'); 

    } catch (error) {
      await t.rollback();
      console.error('Error al aprobar la verificación:', error);
      return res.status(500).send('Error al procesar la aprobación.');
    }
  },
  rejectUser: async (req, res) => {
    const { id } = req.params;
    return res.redirect('/admin?tab=usuarios');
  },
  deleteUser: async (req, res) => {
    
  },
  propertyReview: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Buscamos la propiedad con todas sus relaciones
      const property = await Property.findByPk(id, {
        include: [
          { model: PropertyImage, as: 'images' },
          { model: Service, as: 'services' },
          { model: Guarantee, as: 'guarantees' },
          { model: OperationType, as: 'operation', attributes: ['nombre'] },
          { model: PropertyType, as: 'type', attributes: ['nombre'] },
          { model: User, as: 'owner', attributes: ['nombre', 'apellido', 'email'] }
        ]
      });

      if (!property) {
        return res.status(404).send('Propiedad no encontrada.');
      }

      // 2. Renderizamos la vista de detalle solo lectura
      res.render('reviewProperty', {
        title: `Detalle: ${property.titulo}`,
        stylesheet: 'panel.css', // Usamos el CSS principal de admin
        property
      });

    } catch (error) {
      console.error('Error al ver la propiedad:', error);
      res.status(500).send('Error interno.');
    }
  },
  approveProperty: async (req, res) => {
    const { id } = req.params;

    try {
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).send('Propiedad no encontrada.');
      }

      // 1. Verificamos que esté en estado Pendiente para evitar doble acción
      if (property.estado === 'pendiente') {
        await property.update({ estado: 'disponible' });
      }

      return res.redirect('/admin?tab=inmuebles');

    } catch (error) {
      console.error('Error al aprobar la propiedad:', error);
      return res.status(500).send('Error interno al aprobar.');
    }
  },
  rejectProperty: async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    try {
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).send('Propiedad no encontrada.');
      }

      if (property.estado === 'pendiente') {
        await property.update({ estado: 'rechazado', rejection_reason: rejection_reason || null });
      }

      return res.redirect('/admin?tab=inmuebles');

    } catch (error) {
      console.error('Error al rechazar la propiedad:', error);
      return res.status(500).send('Error interno al rechazar.');
    }
  },
};

export default indexController;