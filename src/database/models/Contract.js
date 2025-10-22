'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Contract extends Model {

    static associate(models) {
      Contract.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'properties'
      });
      Contract.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
      Contract.belongsTo(models.User, {
        foreignKey: 'tenant_id',
        as: 'tenant',
      });
      // Contract.hasMany(Payment, {
      //   foreignKey: 'contract_id',
      //   as: 'payments'
      // });
    }
  }
  Contract.init({
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
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    guarantee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    contract_type: {
      type: DataTypes.ENUM('temporal','largo_plazo'),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pay_frequency: {
      type: DataTypes.ENUM('un_pago','diario','semanal','mensual'),
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10,2).UNSIGNED,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10,2).UNSIGNED,
      allowNull: false
    },
    deposito: {
      type: DataTypes.DECIMAL(10,2).UNSIGNED,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente','activo','finalizado','cancelado'),
      allowNull: false,
      defaultValue: 'pendiente'
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
    modelName: 'Contract',
    tableName: 'contracts',
    underscored: true
  });

  return Contract;
};