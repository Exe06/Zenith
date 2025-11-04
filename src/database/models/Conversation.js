'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Conversation extends Model {
    
    static associate(models) {
      Conversation.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });

      Conversation.belongsTo(models.User, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });

      Conversation.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });

      Conversation.hasMany(models.Message, {
        foreignKey: 'conversation_id',
        as: 'messages'
      });
    }
  }
  Conversation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    property_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    underscored: true
  });
  return Conversation;
};