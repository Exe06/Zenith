'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserRole extends Model {
    
    static associate(models) {
      UserRole.belongsTo(models.User, {
      });
    }
  }

  UserRole.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unsigned: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unsigned: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unsigned: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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