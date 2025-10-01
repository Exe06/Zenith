'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('property_images', [
      {
        property_id: 1,
        filename: 'property1.avif',
        position: 1,
        is_cover: true
      },
      {
        property_id: 1,
        filename: 'property2.avif',
        position: 2,
        is_cover: false
      },
      {
        property_id: 1,
        filename: 'property3.avif',
        position: 3,
        is_cover: false
      },
      {
        property_id: 2,
        filename: 'property4.avif',
        position: 1,
        is_cover: true
      },
      {
        property_id: 2,
        filename: 'property5.avif',
        position: 2,
        is_cover: false
      },
      {
        property_id: 2,
        filename: 'property6.avif',
        position: 3,
        is_cover: false
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_images', null, {}); 
  }
};
