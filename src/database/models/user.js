'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.belongsToMany(models.Role, {
        through: "user_roles",
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
      });

    //   User.hasMany(models.Property, {
    //     foreignKey: 'user_id',
    //     as: 'properties'
    //   });
      
    //   User.hasMany(models.Contracts, {
    //     foreignKey: 'user_id',
    //     as: 'contracts'
    //   });
    };
  };

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unsigned: true,
      primaryKey: true,
    },
    dni: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default.png'
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
      allowNull: true,
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
      where: { name: 'inquilino' },
      transaction: options?.transaction
    });

    if (userRole) {
      await user.addRole(userRole, { transaction: options?.transaction });
    }
  });

  return User;
};