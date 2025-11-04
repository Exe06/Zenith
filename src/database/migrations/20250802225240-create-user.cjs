'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      dni: {
        type: Sequelize.STRING(8),
        allowNull: true,
        unique: true,
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      provincia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default.png'
      },
      dni_front: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dni_back: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bank_account_type: {
        type: Sequelize.ENUM('cbu', 'cvu'),
        allowNull: true
      },
      bank_account_number: {
        type: Sequelize.STRING(22),
        allowNull: true,
        unique: true
      },
      bank_account_alias: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'pendiente'),
        allowNull: false,
        defaultValue: 'activo'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};