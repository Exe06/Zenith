import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db from "../database/models/index.cjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { validationResult } from "express-validator";

const {
  User,
  Property,
  Contract,
  Payment,
  Conversation,
  Message,
  PropertyImage,
  sequelize
} = db;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const userController = {
  register: (req, res) => {
    res.render("register", {
      title: "Registro",
      stylesheet: "register.css",
      provincias,
    });
  },

  proccesRegister: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register", {
        errors: errors.mapped(),
        old: req.body,
        title: "Registro",
        stylesheet: "register.css",
        provincias,
      });
    }

    const { apellido, nombre, dni, email, password, telefono, provincia } =
      req.body;
    try {
      const newUser = await User.create({
        apellido,
        nombre,
        dni,
        email,
        password: bcrypt.hashSync(password, 10),
        telefono,
        provincia,
      });
    } catch (err) {
      console.error(err);
    }
    return res.redirect("/user/login");
  },

  login: (req, res) => {
    res.render("login", { title: "Iniciar Sesión", stylesheet: "login.css" });
  },

  processLogin: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        errors: errors.mapped(),
        old: req.body,
        title: "Iniciar Sesión",
        stylesheet: "login.css",
      });
    }

    const genericError = "Email o contraseña incorrectos.";

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
      attributes: [
        "id",
        "dni",
        "apellido",
        "nombre",
        "email",
        "password",
        "telefono",
        "provincia",
        "imagen",
      ],
    });

    if (!user) {
      return res.render("login", {
        errors: { password: { msg: genericError } },
        old: req.body,
        title: "Iniciar Sesión",
        stylesheet: "login.css",
      });
    }

    const contraseñaValida = bcrypt.compareSync(password, user.password);
    if (!contraseñaValida) {
      return res.render("login", {
        errors: { password: { msg: genericError } },
        old: req.body,
        title: "Iniciar Sesión",
        stylesheet: "login.css",
      });
    }

    const roles = await user.getRoles({ attributes: ["nombre"] });
    const nombreRoles = roles.map((role) => role.nombre);

    const userData = user.get({ plain: true });
    delete userData.password;
    userData.roles = nombreRoles;

    req.session.user = userData;

    return res.redirect("/");
  },

  logout: (req, res) => {
    req.session.destroy();

    res.redirect("/");
  },

  profile: (req, res) => {
    res.render("profile", {
      title: "Mi Perfil",
      stylesheet: "profile.css",
      user: req.session.user,
    });
  },

  managment: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { q, fOperacion, fPropEstado } = req.query;
      const propertyWhere = { user_id: userId };

      if (q) {
        propertyWhere.titulo = { [Op.like]: `%${q}%` };
      }

      if (fPropEstado) {
        propertyWhere.estado = fPropEstado;
      }

      if (fOperacion) {
        propertyWhere.operation_type_id = fOperacion;
      }

      const [
        properties,
        totalPropertiesCount,
        contracts,
        payments,
        conversations,
        expirations,
      ] = await Promise.all([
        Property.findAll({
          where: propertyWhere,
          include: [{ model: PropertyImage, as: "images", limit: 1 }],
          order: [["created_at", "DESC"]],
        }),

        Property.count({
          where: { user_id: userId },
        }),

        Contract.findAll({
          include: [
            {
              model: Property,
              as: "property",
              where: { user_id: userId },
              attributes: ["titulo", "direccion"],
            },
            {
              model: User,
              as: "tenant",
              attributes: ["nombre", "apellido"],
            },
          ],
        }),

        Payment.findAll({
          include: [
            {
              model: Contract,
              as: "contract",
              attributes: ["id"],
              required: true,
              include: [
                {
                  model: Property,
                  as: "property",
                  where: { user_id: userId },
                  attributes: ["titulo"],
                },
                {
                  model: User,
                  as: "tenant",
                  attributes: ["nombre", "apellido"],
                },
              ],
            },
          ],
          order: [["due_date", "DESC"]],
        }),

        Conversation.findAll({
          where: { owner_id: userId },
          include: [
            { model: User, as: "tenant", attributes: ["nombre", "apellido"] },
            { model: Property, as: "property", attributes: ["titulo"] },
            {
              model: Message,
              as: "messages",
              limit: 1,
              order: [["created_at", "DESC"]],
            },
          ],
          order: [["updated_at", "DESC"]],
        }),

        Contract.findAll({
          where: {
            estado: "activo",
            end_date: {
              [Op.between]: [
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 60)),
              ],
            },
          },
          include: [
            {
              model: Property,
              as: "property",
              where: { user_id: userId },
              attributes: ["titulo"],
            },
          ],
          order: [["end_date", "ASC"]],
          limit: 3,
        }),
      ]);

      res.render("managment", {
        title: "Gestión de Propiedades",
        stylesheet: "managment.css",
        properties,
        totalPropertiesCount,
        contracts,
        payments,
        conversations,
        expirations,
        query: req.query,
      });
    } catch (error) {
      console.error("Error al cargar el dashboard de Propietario:", error);
      res.status(500).send("Error al cargar la página");
    }
  },

  edit: (req, res) => {
    res.render("editprofile", {
      title: "Editar Perfil",
      stylesheet: "edit_profile.css",
      user: req.session.user,
      provincias,
    });
  },

  update: async (req, res) => {
    const userId = req.session.user.id;
    if (!userId) return res.redirect("/user/login");

    const user = await User.findByPk(userId);
    const b = req.body;

    if (req.file) {
      const nombreArchivo = req.file.filename;
      if (!nombreArchivo) return res.redirect("/users/edit");
      const avatarAnterior = user.imagen;
      user.imagen = nombreArchivo;
      if (!(avatarAnterior === "default.png")) {
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

    req.session.user = { ...req.session.user, ...userData };

    return res.redirect("/user/profile");
  },

  forgotPass: (req, res) => {
    res.render("forgotPass", {
      title: "Olvidé mi contraseña",
      stylesheet: "forgot_pass.css",
    });
  },

  delete: async (req, res) => {
    const userId = req.session.user.id;
    let userDeleted;

    try {
      userDeleted = await User.findByPk(userId);

      if (!userDeleted) {
        req.session.destroy(() => res.redirect("/"));
        return;
      }

      // 2. Marcar el estado como 'inactivo' (tu lógica de negocio)
      await userDeleted.update({ estado: "inactivo" });

      // 3. Borrar la cuenta (soft-delete). Usamos await para esperar la acción de la DB.
      await userDeleted.destroy();

      // 4. Si el borrado fue exitoso, destruimos la sesión.
      req.session.destroy(() => {
        // Redirigimos al usuario a la página principal una vez la sesión está limpia.
        return res.redirect("/");
      });

    } catch (error) {
      console.error("Error al eliminar la cuenta del usuario:", error);
      return res.redirect("/user/profile");
    }
  },

  verifyAccount: async (req, res) => {
    const userId = req.session.user.id;
    const isOwner = req.session.user.roles?.includes("Propietario");

    if (isOwner) {
      return res.redirect("/user/managment");
    }

    try {
      // 2. Buscamos el estado actual del usuario en la base de datos
      const userInDB = await User.findByPk(userId, {
        attributes: ['estado'] 
      });

      if (!userInDB) {
        return res.redirect("/");
      }

      // 3. Redirección si el estado es PENDIENTE (documentos enviados, esperando revisión)
      if (userInDB.estado === 'pendiente') {
        return res.redirect("/user/verificationPending"); 
      }

      // 4. Si no es propietario y el estado es activo (o nulo), mostramos el formulario
      return res.render("verifyAccount", {
        title: "Verificar Cuenta",
        stylesheet: "verification.css"
      });

    } catch (error) {
      console.error("Error al verificar estado de cuenta:", error);
      return res.status(500).send("Error al cargar la página de verificación.");
    }
  },

  processVerification: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {
        if (req.files) {
          if (req.files.dni_front) {
            fs.unlinkSync(req.files.dni_front[0].path);
          }
          if (req.files.dni_back) {
            fs.unlinkSync(req.files.dni_back[0].path);
          }
        }
      } catch (cleanupError) {
        console.error("Error al limpiar archivos:", cleanupError);
      }
      
      return res.render('verifyAccount', {
        title: 'Verificar Cuenta',
        stylesheet: 'verification.css',
        errors: errors.mapped(),
        old: req.body 
      });
    }

    // 2. Si la validación es exitosa, procesar los datos
    try {
      const { bank_account_type, bank_account_number, bank_account_alias } = req.body;
      
      const dniFrontFilename = req.files.dni_front[0].filename;
      const dniBackFilename = req.files.dni_back[0].filename;
      
      const userId = req.session.user.id;
      const userToUpdate = await User.findByPk(userId);

      if (!userToUpdate) {
        throw new Error('Usuario no encontrado.');
      }

      await userToUpdate.update({
        dni_front: dniFrontFilename,
        dni_back: dniBackFilename,
        bank_account_type: bank_account_type,
        bank_account_number: bank_account_number,
        bank_account_alias: bank_account_alias || null,
        estado: 'pendiente'
      });

      const userData = userToUpdate.get({ plain: true });
      delete userData.password;

      const userRoles = await userToUpdate.getRoles();
      userData.roles = userRoles.map(role => role.nombre);
      req.session.user = userData;

      return res.redirect('/user/verificationPending');

    } catch (error) {
      console.error('Error al procesar la verificación:', error);
      return res.status(500).send('Error interno del servidor.');
    }
  },

  verificationPending: (req, res) => {
    res.render('verificationPending', {
      title: 'Verificación Pendiente',
      stylesheet: 'verificationPending.css'
    });
  },

  panel: async (req, res) => {
    try {
      const userId = req.session.user.id; // El ID del inquilino

      // 1. Buscar los Contratos del inquilino
      const contractsPromise = Contract.findAll({
        where: { tenant_id: userId }, // <-- CLAVE: Donde el usuario es el inquilino
        include: [
          { model: Property, as: 'property', attributes: ['titulo'] },
          { model: User, as: 'owner', attributes: ['nombre', 'apellido'] } // El propietario
        ]
      });

      // 2. Buscar los Pagos del inquilino
      const paymentsPromise = Payment.findAll({
        include: [{
          model: Contract,
          as: 'contract',
          attributes: ['id', 'interest_rate'],
          required: true,
          where: { tenant_id: userId }, // <-- CLAVE: Pagos de contratos del inquilino
          include: [
            { model: Property, as: 'property', attributes: ['titulo'] },
            { model: User, as: 'owner', attributes: ['nombre', 'apellido'] }
          ]
        }],
        order: [['due_date', 'DESC']]
      });

      // 3. Buscar las Conversaciones del inquilino
      const conversationsPromise = Conversation.findAll({
        where: { tenant_id: userId },
        include: [
          { model: User, as: 'owner', attributes: ['nombre', 'apellido'] },
          { model: Property, as: 'property', attributes: ['titulo'] },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']]
          }
        ],
        order: [['updated_at', 'DESC']]
      });

      // Ejecutamos todo
      const [contracts, payments, conversations] = await Promise.all([
        contractsPromise,
        paymentsPromise,
        conversationsPromise
      ]);
      
      // Renderizamos la vista del panel
      res.render('panel', {
        title: 'Mis Alquileres',
        stylesheet: 'panel.css', // <-- ¡USA EL MISMO CSS QUE TU PERFIL!
        contracts,
        payments,
        conversations,
        // 'user' ya está en locals, no hace falta pasarlo
      });

    } catch (error) {
      console.error('Error al cargar el panel de alquileres:', error);
      res.status(500).send('Error al cargar la página');
    }
  },
  startConversation: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`/property/${req.body.property_id}?error=validation`);
    }
    console.log(req.body);

    const { property_id, owner_id, body } = req.body;
    const client_id = req.session.user.id; // ID del inquilino (el que envía)

    // 2. Seguridad: Evitar que el propietario se envíe mensajes a sí mismo
    if (client_id.toString() === owner_id.toString()) {
      return res.redirect(`/property/${property_id}?error=self_message`);
    }

    // 3. Iniciar Transacción
    const t = await sequelize.transaction();

    try {
      // 4. Buscar si ya existe una conversación entre este usuario y esta propiedad
      let conversation = await Conversation.findOne({
        where: {
          property_id: property_id,
          tenant_id: client_id
        }
        // No incluimos la transacción aquí (es solo una búsqueda)
      });

      // 5. Si no existe, la creamos
      if (!conversation) {
        conversation = await Conversation.create({
          property_id: property_id,
          owner_id: owner_id,
          tenant_id: client_id,
          subject: `Consulta por propiedad #${property_id}` // Asunto simple
        }, { transaction: t }); // La creamos DENTRO de la transacción
      }

      // 6. Crear el primer (o siguiente) mensaje
      await Message.create({
        conversation_id: conversation.id,
        sender_id: client_id, // El que envía es el cliente
        body: body
      }, { transaction: t }); // También DENTRO de la transacción

      // 7. Si todo salió bien, confirmar la transacción
      await t.commit();

      // 8. Redirigir al usuario (idealmente a su panel de "Mis Alquileres" o "Mensajes")
      return res.redirect(`/property/${property_id}`);

    } catch (error) {
      await t.rollback(); // Deshacer todo si algo falló
      console.error('Error al iniciar conversación:', error);
      return res.redirect(`/property/${property_id}?error=server_error`);
    }
  },
  showConversation: async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.user.id;

      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          // Incluir la info de la propiedad (para el título)
          { model: Property, as: 'property', attributes: ['titulo'] },
          // Incluir al cliente (inquilino)
          { model: User, as: 'tenant', attributes: ['id', 'nombre', 'apellido'] },
          // Incluir al dueño (propietario)
          { model: User, as: 'owner', attributes: ['id', 'nombre', 'apellido'] },
          // ¡Lo más importante! Incluir los mensajes
          {
            model: Message,
            as: 'messages',
            include: [
              // Incluir quién envió CADA mensaje
              { model: User, as: 'sender', attributes: ['id', 'nombre', 'apellido'] }
            ]
          }
        ],
        // Ordenar los mensajes del más viejo al más nuevo
        order: [
          [ { model: Message, as: 'messages' }, 'created_at', 'ASC'] 
        ]
      });

      // 1. Verificación de Seguridad:
      // ¿El usuario logueado es parte de esta conversación?
      if (!conversation || (userId !== conversation.tenant_id && userId !== conversation.owner_id)) {
        return res.status(403).send('Acceso denegado.');
      }
      
      // 2. Marcar mensajes como leídos (Lógica futura)
      // (Aquí podrías hacer un Message.update({ is_read: true }, ...))

      res.render('chatView', {
        title: `Chat: ${conversation.property.titulo}`,
        stylesheet: 'chat.css',
        conversation,
        user: req.session.user
      });

    } catch (error) {
      console.error('Error al mostrar conversación:', error);
      res.redirect('/user/panel');
    }
  },
  replyToConversation: async (req, res) => {
    const errors = validationResult(req);
    const { conversation_id, body } = req.body;

    console.log(req.body);

    if (!errors.isEmpty()) {
      // Si hay error, redirigir de vuelta al chat con un error
      return res.redirect(`/user/messages/${conversation_id}?error=empty`);
    }

    const sender_id = req.session.user.id;

    try {
      // 1. (Opcional) Verificar que el usuario pertenezca a la conversación
      const conversation = await Conversation.findByPk(conversation_id);
      if (sender_id !== conversation.tenant_id && sender_id !== conversation.owner_id) {
        return res.status(403).send('Acceso denegado.');
      }

      // 2. Crear el nuevo mensaje
      await Message.create({
        conversation_id: conversation_id,
        sender_id: sender_id,
        body: body
      });

      // 3. Redirigir de vuelta a la misma página de chat
      return res.redirect(`/user/messages/${conversation_id}`);

    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      console.log(error);
      
      return res.redirect(`/user/messages/${conversation_id}?error=server`);
    }
  }
};

export default userController;
