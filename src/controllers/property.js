import db from "../database/models/index.cjs";
import { Op, fn, col, where as w } from "sequelize";
import { validationResult } from "express-validator";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const {
  sequelize,
  Property,
  Service,
  PropertyImage,
  PropertyType,
  OperationType,
  Guarantee,
  User,
} = db;

const provincias = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];
const PAGE_SIZE = 12;
const toInt = (v) => (v === "" || v == null ? null : parseInt(String(v), 10));
const toDec = (v) =>
  v === "" || v == null ? null : parseFloat(String(v).replace(",", "."));
const toNum = (v) => (v === "" || v == null ? null : Number(v));
const toBool = (v) =>
  v === "on" || v === true || v === "true" || v === 1 || v === "1";
const arr = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);

function buildQuery(q) {
  const where = {};
  const include = [
    {
      model: PropertyImage,
      as: "images",
      separate: true,
      order: [
        ["position", "ASC"],
        ["id", "ASC"],
      ],
    },
    { model: PropertyType, as: "type", attributes: ["id", "nombre"] },
    { model: OperationType, as: "operation", attributes: ["id", "nombre"] },
    { model: Guarantee, as: "guarantees", attributes: ["id", "nombre"] },
    { model: User, as: "owner", attributes: ["id", "nombre", "apellido"] },
  ];
  const order = [];
  let hasFilters = false;

  // FK numéricas (ajustá si usás enums/clave)
  if (q.tipo) {
    where.property_type_id = Number(q.tipo);
    hasFilters = true;
  }
  if (q.op) {
    where.operation_type_id = Number(q.op);
    hasFilters = true;
  }
  if (q.garantia) {
    // Buscamos el 'include' de Guarantee que ya definimos arriba
    const guaranteeInclude = include.find((inc) => inc.as === "guarantees");

    if (guaranteeInclude) {
      // Le añadimos el 'where' para filtrar por el ID de la garantía
      guaranteeInclude.where = { id: Number(q.garantia) };
      guaranteeInclude.required = true;
    }
    hasFilters = true;
  }

  // ubicación
  if (q.provincia) {
    where.provincia = { [Op.like]: `%${q.provincia}%` };
    hasFilters = true;
  }

  // mínimos
  const minRooms = toNum(q.amb);
  const minBeds = toNum(q.dorm);
  if (minRooms != null) {
    where.ambientes = { [Op.gte]: minRooms };
    hasFilters = true;
  }
  if (minBeds != null) {
    where.habitaciones = { [Op.gte]: minBeds };
    hasFilters = true;
  }

  // precio máx
  const maxPrice = toNum(q.max_price);
  if (maxPrice != null) {
    const priceExpr = fn("COALESCE", col("monto_base"), col("precio_diario"));
    (where[Op.and] ||= []).push(w(priceExpr, { [Op.lte]: maxPrice }));
    hasFilters = true;
  }

  // servicios
  const svcs = arr(q.svc);
  if (svcs.length) {
    include.push({
      model: Service,
      as: "services",
      attributes: [],
      where: { nombre: { [Op.in]: svcs } },
      required: true,
    });
    hasFilters = true;
  }

  // orden
  switch (q.sort) {
    case "price_asc": {
      const priceExpr = fn("COALESCE", col("monto_base"), col("precio_diario"));
      order.push([priceExpr, "ASC"]);
      break;
    }
    case "price_desc": {
      const priceExpr = fn("COALESCE", col("monto_base"), col("precio_diario"));
      order.push([priceExpr, "DESC"]);
      break;
    }
    default:
      order.push(["created_at", "DESC"]);
  }

  return { where, include, order, hasFilters };
}

async function cleanupFiles(files) {
  try {
    if (files) {
      if (files.escritura) {
        await fs.unlink(files.escritura[0].path);
      }
      if (files.images && files.images.length > 0) {
        for (const file of files.images) {
          await fs.unlink(file.path);
        }
      }
    }
  } catch (cleanupError) {
    console.error("Error al limpiar archivos subidos:", cleanupError);
  }
}

const propertyController = {
  search: async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const { where, include, order } = buildQuery(req.query);

      // 1. CONSULTA FILTRADA
      const filteredSearchPromise = Property.findAndCountAll({
        where,
        include,
        order,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        distinct: true,
      });

      // 2. CONSULTA DE CONTEO TOTAL
      const totalPropertiesCountPromise = Property.count({
        where: { estado: "disponible" },
      });

      // 3. EJECUTAR AMBAS
      const [
        { rows, count }, // 'rows' = lista filtrada, 'count' = conteo filtrado
        totalPropertiesCount, // 'totalPropertiesCount' = conteo total
      ] = await Promise.all([
        filteredSearchPromise,
        totalPropertiesCountPromise,
      ]);

      return res.render("search", {
        properties: rows,
        totalPropertiesCount,
        page,
        pages: Math.ceil(count / PAGE_SIZE),
        query: req.query,
        provincias,
        title: "Búsqueda de Inmuebles",
        stylesheet: "search.css",
      });
    } catch (err) {
      console.error(err);
    }
  },

  create: (req, res) => {
    res.render("createProperty", {
      title: "Crear Propiedad",
      stylesheet: "create_property.css",
      provincias,
    });
  },

  ProcessCreate: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("createProperty", {
        errors: errors.mapped(),
        old: req.body,
        title: "Crear Propiedad",
        stylesheet: "create_property.css",
        provincias,
      });
    }

    const t = await sequelize.transaction();
    try {
      const b = req.body;
      const escritura = req.files?.escritura[0];
      const isTemporal = b.operation_type === "2";

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
        monto_base: isTemporal ? null : toDec(b.montoBase),
        deposito: isTemporal ? null : toDec(b.deposito),

        // Temporal
        precio_diario: isTemporal ? toDec(b.dailyPrice) : null,
        descuento_semanal: isTemporal ? toInt(b.weeklyDiscount) : null,
        descuento_mensual: isTemporal ? toInt(b.monthlyDiscount) : null,

        // flags de temporario (checkboxes)
        temp_daily_enabled: isTemporal,
        temp_weekly_enabled: isTemporal,
        temp_monthly_enabled: isTemporal,
        temp_one_time_enabled: isTemporal,

        escritura: escritura.filename
      };

      // Regla de negocio: porcentajes 0-100
      if (propertyData.descuento_semanal != null) {
        propertyData.descuento_semanal = Math.min(
          100,
          Math.max(0, propertyData.descuento_semanal)
        );
      }
      if (propertyData.descuento_mensual != null) {
        propertyData.descuento_mensual = Math.min(
          100,
          Math.max(0, propertyData.descuento_mensual)
        );
      }

      if (!isTemporal) {
        propertyData.temp_daily_enabled = false;
        propertyData.temp_weekly_enabled = false;
        propertyData.temp_monthly_enabled = false;
        propertyData.temp_one_time_enabled = false;
        propertyData.precio_diario = null;
        propertyData.descuento_semanal = null;
        propertyData.descuento_mensual = null;
      }

      const property = await Property.create(propertyData, { transaction: t });

      // Servicios
      const servicios = []
        .concat(b["servicios[]"] || b.servicios || [])
        .filter(Boolean);

      if (servicios.length) {
        const services = await Service.findAll({
          where: { nombre: servicios },
          transaction: t,
        });
        if (services.length)
          await property.addServices(services, { transaction: t });
      }

      if (!isTemporal && b.garantia) {
        await property.setGuarantees(b.garantia, { transaction: t });
      }

      // Imágenes
      const images = req.files?.images || [];
      if (images.length) {
        const rows = images.map((f, i) => ({
          property_id: property.id,
          filename: f.filename,
          position: i + 1,
          is_cover: i === 0,
        }));

        await PropertyImage.bulkCreate(rows, { transaction: t });
      }

      await t.commit();
      return res.redirect("/user/managment");
    } catch (err) {
      await t.rollback();
      console.error(err);
    }

    res.redirect("/user/managment");
  },

  createContract: (req, res) => {
    res.render("createContract", {
      title: "Crear Contrato",
      stylesheet: "contract.css",
    });
  },

  detail: async (req, res) => {
    try {
      const idStr = (req.params.id || "").toString().split("-")[0];
      const id = Number(idStr);
      if (!Number.isFinite(id))
        return res.status(404).redirect("/property/search");

      const property = await Property.findByPk(id, {
        include: [
          {
            model: PropertyImage,
            as: "images",
            separate: true,
            order: [
              ["position", "ASC"],
              ["id", "ASC"],
            ],
          },
          { model: Service, as: "services", through: { attributes: [] } },
          { model: Guarantee, as: "guarantees", through: { attributes: [] } },
          {
            model: User,
            as: "owner",
            attributes: [
              "id",
              "nombre",
              "apellido",
              "email",
              "telefono",
              "imagen",
            ],
          },
          { model: PropertyType, as: "type", attributes: ["id", "nombre"] },
          {
            model: OperationType,
            as: "operation",
            attributes: ["id", "nombre"],
          },
        ],
      });

      if (!property) return res.status(404).redirect("/property/search");

      const opKey = property.operation_type_id;
      const isTemporal = opKey === 2;

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
        discounts: isTemporal
          ? {
              weekly: property.descuento_semanal ?? null,
              monthly: property.descuento_mensual ?? null,
            }
          : null,
        guarantees: property.guarantees,
      };

      return res.render("propertyDetail", {
        property,
        isTemporal,
        display,
        titulo,
        descripcion,
        provincia,
        ciudad,
        barrio,
        title: "Detalle de Inmueble",
        stylesheet: "property_detail.css",
      });
    } catch (err) {
      console.error(err);
    }
  },
  edit: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;

      // 1. Buscamos la propiedad con sus relaciones
      const property = await Property.findByPk(id, {
        include: [
          { model: PropertyImage, as: 'images' },
          { model: Service, as: 'services' },
          { model: Guarantee, as: 'guarantees' }
        ]
      });

      // 2. Verificación de Seguridad:
      if (!property || property.user_id !== userId) {
        return res.redirect('/user/managment');
      }

      console.log(property.services);
      

      // 3. Renderizamos la vista de edición
      res.render('editProperty', {
        title: `Editar: ${property.titulo}`,
        stylesheet: 'create_property.css',
        property, 
        provincias,
        errors: {},
        old: {}
      });

    } catch (error) {
      console.error('Error al mostrar el formulario de edición:', error);
      res.redirect('/user/managment');
    }
  },
  update: async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    
    // 1. Buscamos la propiedad ANTES de validar
    const propertyToUpdate = await Property.findByPk(id, {
      include: ['images', 'services', 'guarantees', 'type', 'operation']
    });

    // 2. Verificación de Seguridad
    if (!propertyToUpdate || propertyToUpdate.user_id !== userId) {
      return res.redirect('/user/managment');
    }  

    // 3. Manejo de Errores de Validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await cleanupFiles(req.files);
      
      // Renderizamos de nuevo el formulario de edición con los errores
      return res.render('editProperty', {
        title: `Editar: ${propertyToUpdate.titulo}`,
        stylesheet: 'create_property.css',
        errors: errors.mapped(),
        old: req.body,
        property: propertyToUpdate,
        provincias
      });
    }

    // 4. Si NO hay errores, iniciamos la transacción
    const t = await sequelize.transaction();
    
    try {
      const b = req.body;
      
      const isTemporal = b.operation_type === "2";

      // --- A. Preparar los datos principales ---
      const propertyData = {
        property_type_id: toInt(b.property_type),
        operation_type_id: toInt(b.operation_type),
        titulo: b.title,
        descripcion: b.descripcion,
        area_total: toInt(b.areaTotal),
        area_cubierta: toInt(b.areaCubierta),
        direccion: b.direccion,
        ciudad: b.ciudad,
        provincia: b.provincia,
        barrio: b.barrio || null,
        pisos: toInt(b.pisos),
        ambientes: toInt(b.ambientes),
        habitaciones: toInt(b.habitaciones),
        banios: toInt(b.banios),
        monto_base: isTemporal ? null : toDec(b.montoBase),
        deposito: isTemporal ? null : toDec(b.deposito),
        precio_diario: isTemporal ? toDec(b.dailyPrice) : null,
        descuento_semanal: isTemporal ? toInt(b.weeklyDiscount) || null : null,
        descuento_mensual: isTemporal ? toInt(b.monthlyDiscount) || null : null,
        temp_daily_enabled: isTemporal,
        temp_weekly_enabled: isTemporal,
        temp_monthly_enabled: isTemporal,
    	  temp_one_time_enabled: isTemporal,
      };
      
      // --- B. Manejar Archivos (Escritura e Imágenes) ---
      // B.1. Si se subió una NUEVA escritura...
      if (req.files?.escritura) {
        if (propertyToUpdate.escritura) {
          await fs.unlink(path.join(__dirname, '..', '..', 'storage', 'escritura', propertyToUpdate.escritura));
        }
        propertyData.escritura = req.files.escritura[0].filename;
      }

      // B.2. Si se marcaron imágenes para BORRAR...
      if (b.delete_images && b.delete_images.length > 0) {
        const imagesToDelete = await PropertyImage.findAll({ where: { id: b.delete_images } });
        for (const img of imagesToDelete) {
          await fs.unlink(path.join(__dirname, '..', '..', 'public', 'img', 'properties', img.filename));
        }
        
        await PropertyImage.destroy({
          where: {
            id: b.delete_images,
            property_id: propertyToUpdate.id
          },
          transaction: t
        });
      }

      // B.3. Si se subieron NUEVAS imágenes...
      if (req.files.images && req.files.images.length > 0) {
        const newImages = req.files.images.map((f, i) => ({
          property_id: propertyToUpdate.id,
          filename: f.filename,
          position: i + 1,
          is_cover: i === 0,
        }));
        await PropertyImage.bulkCreate(newImages, { transaction: t });
      }

      // --- C. Actualizar Datos Principales ---
      await propertyToUpdate.update(propertyData, { transaction: t });

      // --- D. Actualizar Relaciones (Servicios y Garantías) ---
      // D.1. Sincronizar Servicios
      let servicios = b.servicios || [];
      if (servicios && !Array.isArray(servicios)) {
          servicios = [servicios];
      }
      
      const serviceObjects = await Service.findAll({
        where: { nombre: servicios },
        transaction: t
      });
      
      await propertyToUpdate.setServices(serviceObjects, { transaction: t });

      // D.2. Sincronizar Garantías
      if (!isTemporal) {
        await propertyToUpdate.setGuarantees(b.garantia || [], { transaction: t });
      } else {
        await propertyToUpdate.setGuarantees([], { transaction: t }); 
      }

      // --- E. Finalizar ---
      await t.commit();
      return res.redirect('/user/managment');

    } catch (error) {
      await t.rollback(); 
      await cleanupFiles(req.files);
      
      console.error('Error al actualizar la propiedad:', error);
      
      // Devolvemos al usuario al formulario de edición con un error
      return res.render('editProperty', {
        title: `Editar: ${propertyToUpdate.titulo}`,
        stylesheet: 'create_property.css',
        errors: { general: { msg: "Error al guardar la propiedad. Intente de nuevo." } },
        old: req.body,
        property: propertyToUpdate,
        provincias
      });
    }
  },
  delete: async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    
    const t = await sequelize.transaction();

    try {
      const propertyToDestroy = await Property.findOne({
        where: { id: id, user_id: userId },
        include: ['images']
      });

      if (!propertyToDestroy) {
        return res.redirect('/user/managment');
      }

      // 3. Borrar archivos del disco (imágenes)
      if (propertyToDestroy.images && propertyToDestroy.images.length > 0) {
        for (const img of propertyToDestroy.images) {
          const imgPath = path.join(__dirname, '..', '..', 'public', 'img', 'properties', img.filename);
          try {
            await fs.unlink(imgPath);
          } catch (imgErr) { 
            console.error("Error al borrar imagen:", imgPath, imgErr.message);
          }
        }
      }

      // 4. Borrar archivo del disco (escritura)
      if (propertyToDestroy.escritura) {
        const docPath = path.join(__dirname, '..', '..', 'storage', 'escritura', propertyToDestroy.escritura);
        try {
          await fs.unlink(docPath);
        } catch (docErr) {
          console.error("Error al borrar escritura:", docPath, docErr.message);
        }
      }

      // 5. Borrar la propiedad de la DB
      await propertyToDestroy.destroy({ transaction: t });

      // 6. Si todo salió bien
      await t.commit();
      return res.redirect('/user/managment');

    } catch (error) {
      await t.rollback();
      console.error('Error al eliminar la propiedad:', error);
      return res.redirect('/user/managment');
    }
  },
};

export default propertyController;