'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('operation_types', [
      {nombre: 'Alquiler Largo Plazo'},
      {nombre: 'Alquiler Temporal'}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('operation_types', null, {});
  }
};
