'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      contract_id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        },
        onUpdate: 'CASCADE', 
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(10,2).UNSIGNED,
        allowNull: false
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      method: { 
        type: Sequelize.ENUM('transferencia', 'mercado_pago'),
        allowNull: false 
      },
      status: { 
        type: Sequelize.ENUM('pendiente', 'pagado', 'atrasado'),
        allowNull: false, 
        defaultValue: 'pendiente' 
      },
      descrition: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};