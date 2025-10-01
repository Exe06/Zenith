'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      property_type_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'property_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      operation_type_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'operation_types',
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
        onDelete: 'RESTRICT'
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      area_total: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      area_cubierta: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ciudad: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provincia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      barrio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ubicacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pisos: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      ambientes: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      habitaciones: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      banios: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      monto_base: {
        type: Sequelize.DECIMAL(10, 2).UNSIGNED,
        allowNull: true
      },
      deposito: {
        type: Sequelize.DECIMAL(10, 2).UNSIGNED,
        allowNull: true
      },
      expensas: {
        type: Sequelize.DECIMAL(10, 2).UNSIGNED,
        allowNull: true
      },
      precio_diario: {
        type: Sequelize.DECIMAL(10, 2).UNSIGNED,
        allowNull: true
      },
      descuento_semanal: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },
      descuento_mensual: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },
      escritura: {
        type: Sequelize.STRING,
        allowNull: false
      },
      temp_daily_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      temp_weekly_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      temp_monthly_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      temp_one_time_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Disponible'
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
    await queryInterface.dropTable('properties');
  }
};