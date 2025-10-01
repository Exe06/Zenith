'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('property_services', [
      {property_id: 1, service_id: 1},
      {property_id: 1, service_id: 2},
      {property_id: 1, service_id: 3},
      {property_id: 1, service_id: 4},
      {property_id: 2, service_id: 1},
      {property_id: 2, service_id: 5},
      {property_id: 2, service_id: 6},
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_services', null, {}); 
  }
};
