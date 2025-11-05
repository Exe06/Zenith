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
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      paid_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      method: { 
        type: Sequelize.ENUM('transferencia', 'mercado_pago'),
        allowNull: true 
      },
      description: {
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