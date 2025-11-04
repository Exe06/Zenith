'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('property_guarantees', [
      {property_id: 1, guarantee_id: 1},
      {property_id: 1, guarantee_id: 2},
      {property_id: 1, guarantee_id: 3}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_guarantees', null, {});
  }
};
