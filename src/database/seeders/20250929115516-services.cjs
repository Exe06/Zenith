'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      {nombre: 'Agua'},
      {nombre: 'Electricidad'},
      {nombre: 'Gas'},
      {nombre: 'Internet'},
      {nombre: 'Aire Acondicionado'},
      {nombre: 'Calefacción'},
      {nombre: 'Ascensor'},
      {nombre: 'Cochera'},
      {nombre: 'Patio'},
      {nombre: 'Balcón'},
      {nombre: 'Seguridad 24h'},
      {nombre: 'Lavandería'},
      {nombre: 'Piscina'}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};
