'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PropertyGuarantee extends Model {

    static associate(models) {
    }
  }
  PropertyGuarantee.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    guarantee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'PropertyGuarantee',
    tableName: 'property_guarantees',
    timestamps: false
  });

  return PropertyGuarantee;
};