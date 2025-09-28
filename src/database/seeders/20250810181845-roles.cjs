'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {nombre: 'Administrador'},
      {nombre: 'Propietario'},
      {nombre: 'Inquilino'}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {}); 
  }
};
