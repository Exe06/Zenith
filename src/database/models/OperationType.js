'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OperationType extends Model {

    static associate(models) {
      OperationType.hasMany(models.Property, {
        foreignKey: 'operation_type_id',
        as: 'properties'
      });
    }
  }
  OperationType.init({
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
    modelName: 'OperationType',
    tableName: 'operation_types',
    timestamps: false
  });

  return OperationType;
};