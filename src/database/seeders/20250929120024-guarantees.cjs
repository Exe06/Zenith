'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('guarantees', [
      {nombre: 'Propietaria'},
      {nombre: 'Seguro de Caución'},
      {nombre: 'Aval Bancario'}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('guarantees', null, {});
  }
};
