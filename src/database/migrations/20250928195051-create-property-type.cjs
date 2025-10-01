'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('property_types', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('property_types');
  }
};