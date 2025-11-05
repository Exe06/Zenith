'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Guarantee extends Model {

    static associate(models) {
      Guarantee.belongsToMany(models.Property, {
        through: models.PropertyGuarantee,
        foreignKey: 'guarantee_id',
        otherKey: 'property_id',
        as: 'properties'
      });
      Guarantee.hasMany(models.Contract, {
        foreignKey: 'guarantee_id',
        as: 'contracts'
      })
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