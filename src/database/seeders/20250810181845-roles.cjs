'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [{
      name: 'Administrator'
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
