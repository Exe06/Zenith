'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserRole extends Model {
    
    static associate(models) {
    }
  }

  UserRole.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
  },
  {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: false
  });
  
  return UserRole;
};