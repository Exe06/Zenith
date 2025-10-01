'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PropertyService extends Model {

    static associate(models) {
    }
  }
  PropertyService.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      property_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      service_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      }
  },
  {
    sequelize,
    modelName: 'PropertyService',
    tableName: 'property_services',
    timestamps: false
  });

  return PropertyService;
};