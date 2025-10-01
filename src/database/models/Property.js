'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Property extends Model {
    
    static associate(models) {
      Property.belongsTo(models.PropertyType, {
        foreignKey: 'property_type_id',
        as: 'type'
      });
      Property.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'owner'
      });
      Property.belongsTo(models.OperationType, {
        foreignKey: 'operation_type_id',
        as: 'operation'
      });
      Property.belongsTo(models.Guarantee, {
        foreignKey: 'guarantee_id',
        as: 'guarantees'
      });
      Property.belongsToMany(models.Service, {
        through: models.PropertyService,
        foreignKey: 'property_id',
        otherKey: 'service_id',
        as: 'services'
      });
      Property.hasMany(models.PropertyImage, {
        foreignKey: 'property_id',
        as: 'images'
      });
    }
  }
  
  Property.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    property_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    operation_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    guarantee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    area_total: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    area_cubierta: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barrio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pisos: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    ambientes: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    habitaciones: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    banios: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    monto_base: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: true,
    },
    deposito: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: true,
    },
    expensas: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: true,
    },
    precio_diario: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: true,
    },
    descuento_semanal: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    descuento_mensual: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    escritura: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    temp_daily_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    temp_weekly_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    temp_monthly_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    temp_one_time_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Disponible'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  return Property;
};