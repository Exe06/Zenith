'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Service extends Model {

    static associate(models) {
      Service.belongsToMany(models.Property, {
        through: models.PropertyService,
        foreignKey: 'service_id',
        otherKey: 'property_id',
        as: 'properties'
      });
    }
  }
  Service.init({
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
    modelName: 'Service',
    tableName: 'services',
    timestamps: false
  });

  return Service;
};