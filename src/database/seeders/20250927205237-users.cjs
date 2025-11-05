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
      telefono: '1234567890',
      provincia: 'Santiago del Estero',
    }, {
      dni: '34567890',
      apellido: 'Propietario',
      nombre: 'Propietario',
      email: 'prop@prop.com',
      password: bcrypt.hashSync('1234', 10),
      telefono: '1231231234',
      provincia: 'Santiago del Estero'
    }, {
      dni: '23456789',
      apellido: 'Inquilino',
      nombre: 'Inquilino',
      email: 'inq@inq.com',
      password: bcrypt.hashSync('1234', 10),
      telefono: '9876543210',
      provincia: 'Santiago del Estero'
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {}); 
  }
};
