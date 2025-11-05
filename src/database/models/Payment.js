'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Payment extends Model {

    static associate(models) {
      Payment.belongsTo(models.Contract, {
        foreignKey: 'contract_id',
        as: 'contract'
      });
    }
  }
  Payment.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    contract_id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2).UNSIGNED,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paid_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    method: { 
      type: DataTypes.ENUM('transferencia', 'mercado_pago'),
      allowNull: true 
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
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
    }
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    underscored: true
  });

  return Payment;
};