import db from '../database/models/index.cjs';
import { Op, fn, col, where as w } from 'sequelize';
const { sequelize, Property, Service, PropertyImage, PropertyType, OperationType, Guarantee, User } = db;

const provincias = [
    'Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'
];

const PAGE_SIZE = 12;
const toInt = v => (v === '' || v == null) ? null : parseInt(String(v), 10);
const toDec = v => (v === '' || v == null) ? null : parseFloat(String(v).replace(',', '.'));
const toNum = v => (v === '' || v == null ? null : Number(v));
const toBool = v => v === 'on' || v === true || v === 'true' || v === 1 || v === '1';
const arr   = v => Array.isArray(v) ? v : (v != null ? [v] : []);

function buildQuery(q) {
  const where = {};
  const include = [ 
    { model: PropertyImage, as: 'images', separate: true, order: [['position','ASC'], ['id','ASC']] },
    { model: PropertyType, as: 'type', attributes: ['id','nombre'] },
    { model: OperationType, as: 'operation', attributes: ['id','nombre'] },
    { model: Guarantee, as: 'guarantees', attributes: ['id','nombre'] },
    { model: User, as: 'owner', attributes: ['id','nombre','apellido'] },
  ];
  const order = [];
  let hasFilters = false;

  // FK numéricas (ajustá si usás enums/clave)
  if (q.tipo) { where.property_type_id = Number(q.tipo); hasFilters = true; }
  if (q.op) { where.operation_type_id = Number(q.op); hasFilters = true; }
  if (q.garantia) { where.guarantee_id = Number(q.garantia); hasFilters = true; }

  // ubicación
  if (q.provincia) { where.provincia = { [Op.like]: `%${q.provincia}%` }; hasFilters = true; }

  // mínimos
  const minRooms = toNum(q.amb);
  const minBeds  = toNum(q.dorm);
  if (minRooms != null) { where.ambientes = { [Op.gte]: minRooms }; hasFilters = true; }
  if (minBeds  != null) { where.habitaciones = { [Op.gte]: minBeds  }; hasFilters = true; }

  // precio máx
  const maxPrice = toNum(q.max_price);
  if (maxPrice != null) {
    const priceExpr = fn('COALESCE', col('monto_base'), col('precio_diario'));
    (where[Op.and] ||= []).push(w(priceExpr, { [Op.lte]: maxPrice }));
    hasFilters = true;
  }

  // servicios
  const svcs = arr(q.svc);
  if (svcs.length) {
    include.push({
      model: Service,
      as: 'services',
      attributes: [],
      where: { nombre: { [Op.in]: svcs } },
      required: true
    });
    hasFilters = true;
  }

  // orden
  switch (q.sort) {
    case 'price_asc': {
      const priceExpr = fn('COALESCE', col('monto_base'), col('precio_diario'));
      order.push([priceExpr, 'ASC']); break;
    }
    case 'price_desc': {
      const priceExpr = fn('COALESCE', col('monto_base'), col('precio_diario'));
      order.push([priceExpr, 'DESC']); break;
    }
    default:
      order.push(['created_at', 'DESC']);
  }

  return { where, include, order, hasFilters };
}

const propertyController = {
    search: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page || '1', 10), 1);
            const { where, include, order } = buildQuery(req.query);

            const { rows, count } = await Property.findAndCountAll({
                where, include, order,
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
                distinct: true
            });

            return res.render('search', {
                properties: rows,
                page,
                pages: Math.ceil(count / PAGE_SIZE),
                q: req.query,
                provincias,
                title: 'Búsqueda de Inmuebles',
                stylesheet: 'search.css'
            });
        } catch (err) {
            console.error(err);
        }
    },

    create: (req, res) => {
        res.render('createProperty', { title: 'Crear Propiedad', stylesheet: 'create_property.css', provincias });
    },

    ProcessCreate: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const b = req.body;
            const escritura = req.files?.escritura[0]
            
            console.log(req.body);

            const isTemporal = b.operation_type === '2';

            const propertyData = {
                property_type_id: toInt(b.property_type), 
                user_id: req.session.user.id,
                operation_type_id: toInt(b.operation_type),
                titulo: b.title,
                descripcion: b.descripcion,
                area_total: toInt(b.areaTotal),
                area_cubierta: toInt(b.areaCubierta),
                direccion: b.direccion,
                ciudad: b.ciudad,
                provincia: b.provincia,
                barrio: b.barrio || null,
                ubicacion: b.ubicacion || null,

                pisos: toInt(b.pisos),
                ambientes: toInt(b.ambientes),
                habitaciones: toInt(b.habitaciones),
                banios: toInt(b.banios),

                // Largo plazo
                monto_base:        isTemporal ? null : toDec(b.montoBase),
                // payment_frequency:  isTemporal ? null : (b.payment_frequency || null),
                deposito:            isTemporal ? null : toDec(b.deposito),
                expensas:           isTemporal ? null : toDec(b.expensas),
                guarantee_id:          isTemporal ? null : toInt(b.garantia),

                // Temporal
                precio_diario:        isTemporal ? toDec(b.dailyPrice) : null,
                descuento_semanal:    isTemporal ? toInt(b.weeklyDiscount) : null,
                descuento_mensual:   isTemporal ? toInt(b.monthlyDiscount) : null,

                 // flags de temporario (checkboxes)
                temp_daily_enabled:   isTemporal ? toBool(b.temp_daily_enabled)   : false,
                temp_weekly_enabled:  isTemporal ? toBool(b.temp_weekly_enabled)  : false,
                temp_monthly_enabled: isTemporal ? toBool(b.temp_monthly_enabled) : false,
                temp_one_time_enabled:isTemporal ? toBool(b.temp_one_time_enabled): false,

                escritura:          escritura.filename
            };

            // Regla de negocio: porcentajes 0-100
            if (propertyData.descuento_semanal != null) {
                propertyData.descuento_semanal = Math.min(100, Math.max(0, propertyData.descuento_semanal));
            }
            if (propertyData.descuento_mensual != null) {
                propertyData.descuento_mensual = Math.min(100, Math.max(0, propertyData.descuento_mensual));
            }

            if (!isTemporal) {
                propertyData.temp_daily_enabled    = false;
                propertyData.temp_weekly_enabled   = false;
                propertyData.temp_monthly_enabled  = false;
                propertyData.temp_one_time_enabled = false;
                propertyData.precio_diario         = null;
                propertyData.descuento_semanal     = null;
                propertyData.descuento_mensual     = null;
            }

            const property = await Property.create(propertyData, { transaction: t });

            // Servicios
            const servicios = []
            .concat(b['servicios[]'] || b.servicios || [])
            .filter(Boolean);

            if (servicios.length) {
                const services = await Service.findAll({
                    where: { nombre: servicios },
                    transaction: t
                });
                if (services.length) await property.addServices(services, { transaction: t });
            }

            // Imágenes
            const images = req.files?.images || [];
            if (images.length) {
                const rows = images.map((f, i) => ({
                    property_id: property.id,
                    filename: f.filename,
                    position: i + 1,
                    is_cover: i === 0
                }));

                await PropertyImage.bulkCreate(rows, { transaction: t });
            }

            await t.commit();
            return res.redirect('/user/managment');
        } catch (err) {
            console.log(err);
            
            await t.rollback();
        }

        res.redirect('/user/managment');
    },

    createContract: (req, res) => {
        res.render('createContract', { title: 'Crear Contrato', stylesheet: 'contract.css' })
    },

    detail: async (req, res) => {
        try {
            const idStr = (req.params.id || '').toString().split('-')[0];
            const id = Number(idStr);
            if (!Number.isFinite(id)) return res.status(404).redirect('/property/search');

            const property = await Property.findByPk(id, {
            include: [
                // imágenes (ordenadas)
                { model: PropertyImage, as: 'images', separate: true, order: [['position', 'ASC'], ['id', 'ASC']] },
                // servicios/amenities
                { model: Service, as: 'services', through: { attributes: [] } },
                // garantía (0..1)
                { model: Guarantee, as: 'guarantees' },
                // dueño
                { model: User, as: 'owner', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'imagen'] },
                // catálogos (si los tenés)
                { model: PropertyType, as: 'type', attributes: ['id', 'nombre'] },
                { model: OperationType, as: 'operation', attributes: ['id', 'nombre'] },
            ],
            });

            if (!property) return res.status(404).redirect('/property/search');

            const opKey = property.operation_type_id;
            const isTemporal = opKey === 2;

            // Tomar nombres de columnas posibles (es/es-AR vs en)
            const titulo = property.titulo;
            const descripcion = property.descripcion;
            const provincia = property.provincia;
            const ciudad = property.ciudad;
            const barrio = property.barrio;

            // Precio y datos derivados
            const baseAmount = property.monto_base ?? null;
            const dailyPrice = property.precio_diario ?? null;

            const display = {
                price: isTemporal ? dailyPrice : baseAmount,
                deposit: property.deposito != null ? property.deposito : null,
                expenses: property.expensas != null ? property.expensas : null,
                discounts: isTemporal ? {
                    weekly: property.descuento_semanal ?? null,
                    monthly: property.descuento_mensual ?? null,
                } : null,
                guarantee: property.guarantees,
            };

            return res.render('propertyDetail', {
                property,
                isTemporal,
                display,
                titulo, descripcion, provincia, ciudad, barrio,
                title: 'Detalle de Inmueble', stylesheet: 'property_detail.css'
            });
        } catch (err) {
            console.error(err);
        }
    },
    edit: async (req, res) => {
        const propId = req.params.id;
        const property = await Property.findByPk(id, {
            include: [
                // imágenes (ordenadas)
                { model: PropertyImage, as: 'images', separate: true, order: [['position', 'ASC'], ['id', 'ASC']] },
                // servicios/amenities
                { model: Service, as: 'services', through: { attributes: [] } },
                // garantía (0..1)
                { model: Guarantee, as: 'guarantees' },
                // dueño
                { model: User, as: 'owner', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'imagen'] },
                // catálogos (si los tenés)
                { model: PropertyType, as: 'type', attributes: ['id', 'nombre'] },
                { model: OperationType, as: 'operation', attributes: ['id', 'nombre'] },
            ],
        });

        res.render('editProperty', { title: 'Editar Inmobiliaria', stylesheet: 'create_property.css' });
    },
    update: (req, res) => {
        res.redirect('/property');
    },
    delete: (req, res) => {
        res.redirect('/property');
    }
};

export default propertyController;