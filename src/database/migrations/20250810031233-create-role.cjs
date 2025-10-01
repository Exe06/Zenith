'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
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
    await queryInterface.dropTable('roles');
  }
};