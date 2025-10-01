'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PropertyImage extends Model {
    
    static associate(models) {
      PropertyImage.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }
  PropertyImage.init({
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
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'PropertyImage',
    tableName: 'property_images',
    underscored: true
  });
  
  return PropertyImage;
};