'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      dni: '1',
      apellido: 'Admin',
      nombre: 'Admin',
      email: 'admin@admin.com',
      password: bcrypt.hashSync('admin1234', 10),
      telefono: '123456',
      provincia: 'Santiago del Estero',
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {}); 
  }
};
