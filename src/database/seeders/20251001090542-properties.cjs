'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('properties', [
      {
        // FK catálogos (ajusta los ids a los tuyos)
        property_type_id: 1,
        user_id: 1, 
        operation_type_id: 1,      // 1 = largo plazo
        // guarantee_id: 1,

        titulo: 'Depto céntrico - 2 amb',
        descripcion: 'Departamento luminoso con balcón, a metros del centro.',
        area_total: 60,
        area_cubierta: 55,
        direccion: 'Av. Principal 123',
        ciudad: 'Santiago del Estero',
        provincia: 'Santiago del Estero',
        barrio: 'Centro',
        ubicacion: null,

        pisos: 1,
        ambientes: 2,
        habitaciones: 1,
        banios: 1,

        // Largo plazo
        monto_base: 320000.00,
        deposito: 320000.00,

        // Temporal (no aplica)
        precio_diario: null,
        descuento_semanal: null,
        descuento_mensual: null,

        escritura: 'escritura_depto123.pdf',

        // flags temporario
        temp_daily_enabled: false,
        temp_weekly_enabled: false,
        temp_monthly_enabled: false,
        temp_one_time_enabled: false,
      },

      // === TEMPORARIO ===
      {
        property_type_id: 2,       // ej: Loft
        user_id: 1,
        operation_type_id: 2,      // 2 = temporario
        // guarantee_id: null,

        titulo: 'Loft moderno',
        descripcion: 'Loft con cochera y gran ventanal. Ideal estadías cortas.',
        area_total: 48,
        area_cubierta: 45,
        direccion: 'Calle 9 de Julio 555',
        ciudad: 'Santiago del Estero',
        provincia: 'Santiago del Estero',
        barrio: 'Norte',
        ubicacion: null,

        pisos: 1,
        ambientes: 1,
        habitaciones: 1,
        banios: 1,

        // Largo plazo (no aplica)
        monto_base: null,
        deposito: null,

        // Temporal
        precio_diario: 20000.00,
        descuento_semanal: 10,     // %
        descuento_mensual: 20,     // %

        escritura: 'escritura_loft555.pdf',

        // flags temporario: habilitá lo que ofrezcas
        temp_daily_enabled: true,
        temp_weekly_enabled: true,
        temp_monthly_enabled: true,
        temp_one_time_enabled: true,
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('properties', null, {});
  }
};
