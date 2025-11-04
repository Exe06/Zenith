'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
      });

      User.hasMany(models.Property, {
        foreignKey: 'user_id',
        as: 'properties'
      });
      
      User.hasMany(models.Contract, {
        foreignKey: 'owner_id',
        as: 'contracts_owned'
      });

      User.hasMany(models.Contract, {
        foreignKey: 'tenant_id',
        as: 'contracts_rented'
      });

      User.hasMany(models.Conversation, {
        foreignKey: 'tenant_id',
        as: 'tenant_conversations'
      });

      User.hasMany(models.Conversation, {
        foreignKey: 'owner_id',
        as: 'owner_conversations'
      });

      User.hasMany(models.Message, {
        foreignKey: 'sender_id',
        as: 'sent_messages'
      });
    };
  };

  User.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    dni: {
      type: DataTypes.STRING(8),
      allowNull: true,
      unique: true,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default.png'
    },
    dni_front: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dni_back: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_account_type: {
      type: DataTypes.ENUM('cbu', 'cvu'),
      allowNull: true
    },
    bank_account_number: {
      type: DataTypes.STRING(22),
      allowNull: true,
      unique: true
    },
    bank_account_alias: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'pendiente'),
      allowNull: false,
      defaultValue: 'activo'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  // Asignar rol "Inquilino" por defecto al crear un usuario
  User.afterCreate(async (user, options) => {
    const { Role } = user.sequelize.models;
    const userRole = await Role.findOne({
      where: { id: '3' },
      transaction: options?.transaction
    });

    if (userRole) {
      await user.addRole(userRole, { transaction: options?.transaction });
    }
  });

  User.beforeDestroy(async (user, options) => {
    const { Property } = user.sequelize.models;

    if (!options.force) {
      const count = await Property.count({ where: { user_id: user.id }, transaction: options.transaction });
      if (count > 0) throw new Error('No podés eliminar tu cuenta: hay propiedades asociadas.');
    }
  });

  return User;
};