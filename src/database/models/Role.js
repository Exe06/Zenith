'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Role extends Model {
    
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'users'
      });
    };
  };

  Role.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false
  });
  
  return Role;
};