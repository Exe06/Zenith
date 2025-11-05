'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      property_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      owner_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tenant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      guarantee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'guarantees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      contract_type: {
        type: Sequelize.ENUM('temporal','largo_plazo'),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pay_frequency: {
        type: Sequelize.ENUM('un_pago','diario','semanal','mensual'),
        allowNull: false
      },
      daily_price: {
        type: Sequelize.DECIMAL(10,2).UNSIGNED,
        allowNull: true
      },
      monto_base: {
        type: Sequelize.DECIMAL(10,2).UNSIGNED,
        allowNull: true
      },
      deposito: {
        type: Sequelize.DECIMAL(10,2).UNSIGNED,
        allowNull: true
      },
      total: {
        type: Sequelize.DECIMAL(10,2).UNSIGNED,
        allowNull: false
      },
      interest_rate: {
        type: Sequelize.DECIMAL(5, 2).UNSIGNED,
        allowNull: true
      },
      adjustment_index: {
        type: Sequelize.STRING, 
        allowNull: true
      },
      adjustment_period_months: {
        type: Sequelize.TINYINT.UNSIGNED, 
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente','activo','finalizado','canceledo'),
        allowNull: false,
        defaultValue: 'pendiente'
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
    await queryInterface.dropTable('contracts');
  }
};