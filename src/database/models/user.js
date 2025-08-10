'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
    //   User.belongsToMany(models.Role, {
    //     through: "UserRoles",
    //     foreignKey: 'user_id',
    //     otherKey: 'role_id',
    //     as: 'roles'
    //   });

    //   User.hasMany(models.Property, {
    //     foreignKey: 'user_id',
    //     as: 'properties'
    //   });
      
    //   User.hasMany(models.Contracts, {
    //     foreignKey: 'user_id',
    //     as: 'contracts'
    //   });
    }
  }

  User.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
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
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      province: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '/img/users/default.png'
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
  return User;
};
