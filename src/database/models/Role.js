'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Role extends Model {
    
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: "user_roles",
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'users'
      });
    };
  };

  Role.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unsigned: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false,
  });
  
  return Role;
};