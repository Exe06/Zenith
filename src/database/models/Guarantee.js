'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Guarantee extends Model {

    static associate(models) {
      Guarantee.hasMany(models.Property, {
        foreignKey: 'guarantee_id',
        as: 'properties'
      });
    }
  }
  Guarantee.init({
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
    modelName: 'Guarantee',
    tableName: 'guarantees',
    timestamps: false
  });

  return Guarantee;
};