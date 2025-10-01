'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PropertyType extends Model {
    
    static associate(models) {
      PropertyType.hasMany(models.Property, {
        foreignKey: 'property_type_id',
        as: 'properties'
      });
    }
  }
  PropertyType.init({
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
    modelName: 'PropertyType',
    tableName: 'property_types',
    timestamps: false
  });
  
  return PropertyType;
};