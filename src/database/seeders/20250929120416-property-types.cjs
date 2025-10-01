'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('property_types', [
      {nombre: 'Casa'},
      {nombre: 'Departamento'},
      {nombre: 'Monoambiente'}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_types', null, {});
  }
};
