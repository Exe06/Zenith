'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Conversation, {
        foreignKey: 'conversation_id',
        as: 'conversation'
      });

      Message.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
    }
  }
  Message.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    conversation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'Message',
    tableName: 'messages',
    underscored: true
  });
  return Message;
};