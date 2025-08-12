'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [{
      name: 'Administrador'
    }, {
      name: 'Propietario'
    }, {
      name: 'Inquilino'
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {}); 
  }
};
